"use server";

import Papa from "papaparse";
import { getSecurityNiks } from "@/lib/google-sheet";
import { normalizeNik } from "@/lib/nik-normalizer";

// import fs from 'fs/promises';
// import path from 'path';

export async function processCombinedCsv(formData: FormData) {
  const fileFr = formData.get("fileFr") as File;
  const fileBiostar = formData.get("fileBiostar") as File;
  
  if (!fileFr || !fileBiostar) {
    return { success: false, error: "Harap upload kedua file (FR & Biostar)" };
  }

  // 1. Ambil database Divisi Pengamanan (Bisa digabung dari kedua Sheet jika perlu, 
  // atau pakai salah satu jika isinya sama)
  const securityNiksArray = await getSecurityNiks("BIOSTAR"); 
  const validSecurityNiks = new Set(securityNiksArray);

  // WADAH GABUNGAN (Otomatis membuang duplikat)
  const combinedUniqueNiks = new Set<string>();

  // ==========================================
  // 2. PROSES FILE FR
  // ==========================================
  const textFr = await fileFr.text();
  const parsedFr = Papa.parse(textFr, { header: true, skipEmptyLines: true });
  const rawFr = parsedFr.data as Record<string, string>[];

  rawFr.forEach((row) => {
    if (row.Side === "Reader - In" && row["NIK (Cardholder)"]) {
      // Normalisasi NIK FR (misal: Q211 -> 90211) lalu masukkan ke wadah
      combinedUniqueNiks.add(normalizeNik(row["NIK (Cardholder)"]));
    }
  });

  // ==========================================
  // 3. PROSES FILE BIOSTAR
  // ==========================================
  const textBiostar = await fileBiostar.text();
  const parsedBiostar = Papa.parse(textBiostar, { header: false, skipEmptyLines: true });
  const rawBiostar = parsedBiostar.data as string[][];

  const validStatuses = ["Verify Success", "Verify Success(Card Only)"];
  
  rawBiostar.forEach((row) => {
    if (row.length >= 5) {
      const status = row[2]?.trim();
      const side = row[3]?.trim().toLowerCase();
      const rawNik = row[4]?.trim();

      if (validStatuses.includes(status) && side === "masuk" && rawNik) {
        // Normalisasi NIK Biostar (misal: 90211 -> 90211) lalu masukkan ke wadah yang SAMA
        combinedUniqueNiks.add(normalizeNik(rawNik));
      }
    }
  });

  // ==========================================
  // 4. KALKULASI HASIL GABUNGAN (BEBAS DUPLIKAT LINTAS MESIN)
  // ==========================================
  const totalKaryawanGabungan = combinedUniqueNiks.size;


  //testing

//   const dataArray = Array.from(combinedUniqueNiks);
//   const jsonString = JSON.stringify(dataArray, null, 2);
//   const filePath = path.join(process.cwd(), 'public', 'combined_niks.json');
//     fs.writeFile(filePath, jsonString, 'utf8');





  let totalKaryawanPengamanan = 0;
  combinedUniqueNiks.forEach((nik) => {
    // Karena NIK sudah dinormalisasi semua jadi angka, pencocokan dengan G-Sheets dijamin akurat
    if (validSecurityNiks.has(nik)) {
      totalKaryawanPengamanan++;
    }
  });

  return {
    success: true,
    totalKaryawanGabungan,
    totalKaryawanPengamanan,
  };
}