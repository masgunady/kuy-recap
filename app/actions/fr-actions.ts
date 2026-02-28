"use server";

import Papa from "papaparse";

export async function processFrCsv(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "File tidak ditemukan" };
  }

  // Membaca file sebagai string untuk di-parse
  const fileText = await file.text();

  const result = Papa.parse(fileText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawData = result.data as Record<string, string>[];

  // 1. Filter hanya EVENT: "Reader - In"
  const readerIn = rawData.filter(
    (row) => row.Side === "Reader - In" && row["NIK (Cardholder)"],
  );

  // Set digunakan untuk mencegah perhitungan duplikat (unik)
  const uniqueNiks = new Set<string>();
  const doorMap: Record<string, Set<string>> = {};

  // 2. Kalkulasi duplikasi per-karyawan dan per-DOOR
  readerIn.forEach((row) => {
    const nik = row["NIK (Cardholder)"];
    const door = row["Door"];

    // Menambah NIK ke perhitungan total seluruh karyawan
    uniqueNiks.add(nik);

    // Menambah NIK ke perhitungan spesifik per-DOOR
    if (door) {
      if (!doorMap[door]) {
        doorMap[door] = new Set<string>();
      }
      doorMap[door].add(nik);
    }
  });

  // 3. Rekap Total
  const totalKaryawan = uniqueNiks.size;

  // Format ke bentuk Array Object untuk di-render oleh tabel shadcn/ui
  const doorStats = Object.keys(doorMap)
    .map((door) => ({
      doorName: door,
      total: doorMap[door].size,
    }))
    .sort((a, b) => a.doorName.localeCompare(b.doorName)); // Urutkan dari pintu terpadat ke tersepi

  return {
    success: true,
    totalKaryawan,
    totalRawRows: rawData.length,
    doorStats,
    previewData: readerIn.slice(0, 5), // Kirim 5 baris pertama sebagai preview tabel
  };
}
