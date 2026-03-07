"use server";

import Papa from "papaparse";
import { getSecurityNiks, getDoorMapping } from "@/lib/google-sheets";
import { normalizeNik } from "@/lib/nik-normalizer";

// FUNGSI PINTAR: Mengecek apakah jam absensi masuk dalam rentang waktu yang dipilih
function checkTimeRange(
  timestamp: string,
  startTime: string,
  endTime: string,
): boolean {
  if (!timestamp || !startTime || !endTime) return true;

  try {
    const parts = timestamp.trim().split(/\s+/);
    // Waktu biasanya ada di bagian kedua (indeks 1), contoh: "2026-02-27 05:30:00"
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    if (!timePart || !timePart.includes(":")) return true;

    // Ambil format HH:MM agar bisa dibandingkan langsung
    const timeSplit = timePart.split(":");
    const currentHHMM = `${timeSplit[0].padStart(2, "0")}:${timeSplit[1].padStart(2, "0")}`;

    // LOGIKA RENTANG WAKTU
    if (startTime <= endTime) {
      // Shift Normal (contoh: 05:00 sampai 15:00)
      return currentHHMM >= startTime && currentHHMM <= endTime;
    } else {
      // Shift Lintas Hari / Malam (contoh: 21:00 sampai 06:00)
      // Artinya: Waktu di atas 21:00 ATAU di bawah 06:00
      return currentHHMM >= startTime || currentHHMM <= endTime;
    }
  } catch (error) {
    // Jika format waktu hancur, loloskan saja
    return true;
  }
}

export async function processCombinedCsv(formData: FormData) {
  const fileFr = formData.get("fileFr") as File;
  const fileBiostar = formData.get("fileBiostar") as File;
  const startTime = (formData.get("startTime") as string) || "00:00";
  const endTime = (formData.get("endTime") as string) || "23:59";

  if (!fileFr || !fileBiostar)
    return { success: false, error: "Harap upload kedua file" };

  const securityNiksArray = await getSecurityNiks("BIOSTAR");
  const validSecurityNiks = new Set(securityNiksArray);
  const doorToLineMapping = await getDoorMapping();

  const totalHadir = new Set<string>();
  const hadirJakarta = new Set<string>();
  const hadirKarawang = new Set<string>();

  const totalSecurity = new Set<string>();
  const securityJakarta = new Set<string>();
  const securityKarawang = new Set<string>();

  const lineMap: Record<string, Set<string>> = {};

  function processRecord(doorName: string, nik: string) {
    if (!doorName || !nik) return;

    const lineName = doorToLineMapping[doorName] || "Belum Terklasifikasi";
    const isJakarta = lineName.toUpperCase().includes("JAKARTA");

    totalHadir.add(nik);
    if (isJakarta) hadirJakarta.add(nik);
    else hadirKarawang.add(nik);

    if (validSecurityNiks.has(nik)) {
      totalSecurity.add(nik);
      if (isJakarta) securityJakarta.add(nik);
      else securityKarawang.add(nik);
    }

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
      // FILTER RENTANG WAKTU
      if (checkTimeRange(row["Event timestamp"], startTime, endTime)) {
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
      // FILTER RENTANG WAKTU
      if (checkTimeRange(row[0], startTime, endTime)) {
        processRecord(row[1]?.trim(), normalizeNik(row[4]?.trim()));
      }
    }
  });

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
