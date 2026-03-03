"use client";

import { useState, useTransition } from "react";
import { processCombinedCsv } from "@/app/actions/cross-action"; // Sesuaikan nama file action Anda
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, CheckSquare, Loader2, FileText, Layers, UploadCloud } from "lucide-react";

type CombinedStatsType = {
  totalKaryawanGabungan: number;
  totalKaryawanPengamanan: number;
};

export default function KonsolidasiPage() {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<CombinedStatsType | null>(null);
  
  // State terpisah untuk kedua file
  const [fileFr, setFileFr] = useState<File | null>(null);
  const [fileBiostar, setFileBiostar] = useState<File | null>(null);

  const handleProcess = () => {
    if (!fileFr || !fileBiostar) return;

    const formData = new FormData();
    formData.append("fileFr", fileFr);
    formData.append("fileBiostar", fileBiostar);

    startTransition(async () => {
      const result = await processCombinedCsv(formData);
      
      if (result.success) {
        setStats({
          totalKaryawanGabungan: result.totalKaryawanGabungan!,
          totalKaryawanPengamanan: result.totalKaryawanPengamanan!,
        });
      } else {
        console.error("Gagal memproses file gabungan", result.error);
        alert(result.error);
      }
    });
  };

  return (
    <main className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Kuy<span className="text-indigo-500">ReCap</span> (Cross Platform)
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 w-full">
        {/* INPUT: FILE FR */}
        <Card className="border-indigo-100 shadow-sm w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs">Mesin 1</span>
              Data Absensi FR
            </CardTitle>
            {fileFr ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-indigo-50 p-2 rounded-md border border-indigo-100">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="truncate flex-1 font-medium text-slate-700">{fileFr.name}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Belum ada file FR</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-indigo-200 p-6 transition-colors hover:bg-indigo-50/50 w-full min-h-[120px] text-center overflow-hidden">
              <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                <UploadCloud className="mb-2 h-6 w-6 text-indigo-400" />
                <p className="text-xs font-medium text-indigo-600">Klik / Drop file FR</p>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFileFr(e.target.files?.[0] || null)}
                disabled={isPending}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20 file:cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* INPUT: FILE BIOSTAR */}
        <Card className="border-indigo-100 shadow-sm w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">Mesin 2</span>
              Data Absensi Biostar
            </CardTitle>
            {fileBiostar ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-indigo-50 p-2 rounded-md border border-indigo-100">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="truncate flex-1 font-medium text-slate-700">{fileBiostar.name}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Belum ada file Biostar</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-indigo-200 p-6 transition-colors hover:bg-indigo-50/50 w-full min-h-[120px] text-center overflow-hidden">
              <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                <UploadCloud className="mb-2 h-6 w-6 text-indigo-400" />
                <p className="text-xs font-medium text-indigo-600">Klik / Drop file Biostar</p>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFileBiostar(e.target.files?.[0] || null)}
                disabled={isPending}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20 file:cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOMBOL PROSES */}
      <div className="flex justify-center w-full my-6">
        <Button 
          onClick={handleProcess} 
          disabled={!fileFr || !fileBiostar || isPending}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-1/3 shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyatukan Data...
            </>
          ) : (
            <>
              <Layers className="mr-2 h-5 w-5" />
              Proses Rekap Gabungan
            </>
          )}
        </Button>
      </div>

      {/* REKAP HASIL */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Card: Seluruh Karyawan (Bebas Duplikat Lintas Mesin) */}
          <Card className="bg-indigo-500 text-white shadow-sm w-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium uppercase opacity-90">
                Total Karyawan Hadir
              </CardTitle>
              <Users className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {stats.totalKaryawanGabungan.toLocaleString()}
              </div>
              <p className="text-xs opacity-75 mt-1">
                Data unik gabungan (FR + Biostar)
              </p>
            </CardContent>
          </Card>

          {/* Card: Divisi Pengamanan (Sesuai Spreadsheet) */}
          <Card className="bg-emerald-600 text-white shadow-sm w-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium uppercase opacity-90">
                Divisi Pengamanan Hadir
              </CardTitle>
              <CheckSquare className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {stats.totalKaryawanPengamanan.toLocaleString()}
              </div>
              <p className="text-xs opacity-75 mt-1">
                Cocok dengan G-Sheets Pengamanan
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}