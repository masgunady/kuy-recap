"use server";

import Papa from "papaparse";
import { getSecurityNiks } from "@/lib/google-sheets";

export async function processBiostarCsv(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "File tidak ditemukan" };
  }

  const securityNiksArray = await getSecurityNiks("BIOSTAR");
  const validSecurityNiks = new Set(securityNiksArray);

  const fileText = await file.text();

  // header: false karena Biostar tidak memiliki judul kolom
  const result = Papa.parse(fileText, {
    header: false,
    skipEmptyLines: true,
  });

  const rawData = result.data as string[][];

  // Pemetaan Kolom Berdasarkan Indeks:
  // 0 = TIMESTAMP
  // 1 = DOOR
  // 2 = STATUS
  // 3 = SIDE
  // 4 = NIK
  // 5 = CARD HOLDER

  const validStatuses = ["Verify Success", "Verify Success(Card Only)"];

  // 1. Filter data hanya yang Masuk dan Status Success
  const masukData = rawData.filter((row) => {
    if (row.length < 5) return false; // Pastikan data baris tidak rusak (minimal ada NIK)

    const status = row[2]?.trim();
    // Gunakan toLowerCase() untuk jaga-jaga ada tipe penulisan "MASUK" atau "Masuk"
    const side = row[3]?.trim().toLowerCase();
    const nik = row[4]?.trim();

    return validStatuses.includes(status) && side === "masuk" && nik;
  });

  const uniqueNiks = new Set<string>();
  const doorMap: Record<string, Set<string>> = {};

  // 2. Kalkulasi duplikasi per-karyawan dan per-DOOR
  masukData.forEach((row) => {
    const door = row[1]?.trim();
    const nik = row[4]?.trim();

    uniqueNiks.add(nik); // Set otomatis mencegah NIK dobel

    if (door) {
      if (!doorMap[door]) {
        doorMap[door] = new Set<string>();
      }
      doorMap[door].add(nik);
    }
  });

  // 3. Rekap Total
  const totalKaryawan = uniqueNiks.size;

  let totalKaryawanPengamanan = 0;
  uniqueNiks.forEach((nik) => {
    if (validSecurityNiks.has(nik)) {
      totalKaryawanPengamanan++;
    }
  });

  // Format array object & Sort dari A-Z berdasarkan Nama Pintu
  const doorStats = Object.keys(doorMap)
    .map((door) => ({
      doorName: door,
      total: doorMap[door].size,
    }))
    .sort((a, b) => a.doorName.localeCompare(b.doorName));

  // Beri header fiktif (manual mapping) untuk tabel Preview UI
  const previewData = masukData.slice(0, 5).map((row) => ({
    Waktu: row[0],
    Perangkat: row[1],
    Status: row[2],
    Side: row[3],
    NIK: row[4],
    Nama: row[5] || "-",
  }));

  return {
    success: true,
    totalKaryawan,
    totalKaryawanPengamanan,
    totalRawRows: rawData.length,
    doorStats,
    previewData,
  };
}
