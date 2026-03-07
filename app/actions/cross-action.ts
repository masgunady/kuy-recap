"use server";

import Papa from "papaparse";
import { getSecurityNiks, getDoorMapping } from "@/lib/google-sheets";
import { normalizeNik } from "@/lib/nik-normalizer";

// FUNGSI PINTAR: Mengecek apakah jam absensi sesuai dengan shift yang dipilih
function checkShift(timestamp: string, shift: string): boolean {
  if (!timestamp || shift === "semua") return true;

  try {
    // Membelah string berdasarkan spasi (mengatasi spasi ganda yang tidak terduga)
    const parts = timestamp.trim().split(/\s+/);

    // Waktu biasanya ada di bagian kedua (indeks 1), contoh: "2026-02-27 05:30:00"
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    if (!timePart || !timePart.includes(":")) return true;

    // Ambil 2 digit angka pertama (Jam)
    const hour = parseInt(timePart.split(":")[0], 10);
    if (isNaN(hour)) return true;

    // LOGIKA FILTER JAM SHIFT
    if (shift === "pagi") {
      return hour >= 5 && hour < 13; // 05:00 - 12:59
    } else if (shift === "siang") {
      return hour >= 13 && hour < 21; // 13:00 - 20:59
    } else if (shift === "malam") {
      return hour >= 21 || hour < 5; // 21:00 - 04:59
    }
  } catch (error) {
    // Jika format waktu hancur/tidak terbaca, biarkan lolos agar data tidak hilang
    return true;
  }

  return true;
}

export async function processCombinedCsv(formData: FormData) {
  const fileFr = formData.get("fileFr") as File;
  const fileBiostar = formData.get("fileBiostar") as File;
  const shift = (formData.get("shift") as string) || "semua"; // Tangkap parameter shift dari UI

  if (!fileFr || !fileBiostar)
    return { success: false, error: "Harap upload kedua file" };

  const securityNiksArray = await getSecurityNiks("BIOSTAR");
  const validSecurityNiks = new Set(securityNiksArray);
  const doorToLineMapping = await getDoorMapping();

  // (Untuk memisahkan wilayah)
  const totalHadir = new Set<string>();
  const hadirJakarta = new Set<string>();
  const hadirKarawang = new Set<string>();

  const totalSecurity = new Set<string>();
  const securityJakarta = new Set<string>();
  const securityKarawang = new Set<string>();

  const lineMap: Record<string, Set<string>> = {};

  // FUNGSI PEMROSES DATA
  function processRecord(doorName: string, nik: string) {
    if (!doorName || !nik) return;

    const lineName = doorToLineMapping[doorName] || "Belum Terklasifikasi";

    // Identifikasi Wilayah (Asumsi jika string line mengandung kata "JAKARTA")
    const isJakarta = lineName.toUpperCase().includes("JAKARTA");

    // 1. Catat Total Keseluruhan
    totalHadir.add(nik);
    if (isJakarta) hadirJakarta.add(nik);
    else hadirKarawang.add(nik);

    // 2. Catat Khusus Divisi Pengamanan
    if (validSecurityNiks.has(nik)) {
      totalSecurity.add(nik);
      if (isJakarta) securityJakarta.add(nik);
      else securityKarawang.add(nik);
    }

    // 3. Catat Rekap Per-Line
    if (!lineMap[lineName]) {
      lineMap[lineName] = new Set<string>();
    }
    lineMap[lineName].add(nik);
  }

  // BACA FILE FR
  const parsedFr = Papa.parse(await fileFr.text(), {
    header: true,
    skipEmptyLines: true,
  });
  (parsedFr.data as Record<string, string>[]).forEach((row) => {
    if (row.Side === "Reader - In" && row["NIK (Cardholder)"]) {
      // TERAPKAN FILTER SHIFT (Kolom Event timestamp)
      if (checkShift(row["Event timestamp"], shift)) {
        processRecord(
          row["Door"]?.trim(),
          normalizeNik(row["NIK (Cardholder)"]),
        );
      }
    }
  });

  // BACA FILE BIOSTAR
  const parsedBiostar = Papa.parse(await fileBiostar.text(), {
    header: false,
    skipEmptyLines: true,
  });
  const validStatuses = ["Verify Success", "Verify Success(Card Only)"];
  (parsedBiostar.data as string[][]).forEach((row) => {
    if (
      row.length >= 5 &&
      validStatuses.includes(row[2]?.trim()) &&
      row[3]?.trim().toLowerCase() === "masuk" &&
      row[4]?.trim()
    ) {
      // TERAPKAN FILTER SHIFT (Kolom indeks 0 / Waktu)
      if (checkShift(row[0], shift)) {
        processRecord(row[1]?.trim(), normalizeNik(row[4]?.trim()));
      }
    }
  });

  // FORMAT DATA UNTUK UI
  const lineStats = Object.keys(lineMap)
    .map((line) => ({ lineName: line, total: lineMap[line].size }))
    .sort((a, b) => a.lineName.localeCompare(b.lineName));

  return {
    success: true,
    stats: {
      totalHadir: totalHadir.size,
      hadirJakarta: hadirJakarta.size,
      hadirKarawang: hadirKarawang.size,
      totalSecurity: totalSecurity.size,
      securityJakarta: securityJakarta.size,
      securityKarawang: securityKarawang.size,
      lineStats,
    },
  };
}
