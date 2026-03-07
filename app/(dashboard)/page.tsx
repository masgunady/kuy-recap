"use client";

import { useState, useTransition } from "react";
import { processCombinedCsv } from "@/app/actions/cross-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  CheckSquare,
  Loader2,
  FileText,
  Layers,
  UploadCloud,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type CombinedStatsType = {
  totalHadir: number;
  hadirJakarta: number;
  hadirKarawang: number;
  totalSecurity: number;
  securityJakarta: number;
  securityKarawang: number;
  lineStats: { lineName: string; total: number }[];
};

export default function KonsolidasiPage() {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<CombinedStatsType | null>(null);

  const [fileFr, setFileFr] = useState<File | null>(null);
  const [fileBiostar, setFileBiostar] = useState<File | null>(null);

  // STATE BARU UNTUK RENTANG WAKTU (Default Seharian Penuh)
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");

  const [activeRangeLabel, setActiveRangeLabel] = useState<string>("");

  const handleProcess = () => {
    if (!fileFr || !fileBiostar) return;

    const formData = new FormData();
    formData.append("fileFr", fileFr);
    formData.append("fileBiostar", fileBiostar);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);

    startTransition(async () => {
      const result = await processCombinedCsv(formData);

      if (result.success && result.stats) {
        setStats(result.stats);
        setActiveRangeLabel(`${startTime} s/d ${endTime}`);
      } else {
        console.error("Gagal memproses file gabungan", result.error);
        alert(result.error || "Terjadi kesalahan saat memproses data.");
      }
    });
  };

  return (
    <main className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Ri<span className="text-sky-500">Cap</span> (Cross-System)
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 w-full">
        {/* INPUT FILE FR */}
        <Card className="border-sky-100 shadow-sm w-full h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs">
                Mesin 1
              </span>
              Data Absensi FR
            </CardTitle>
            {fileFr ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-sky-50 p-2 rounded-md border border-sky-100">
                <FileText className="h-4 w-4 text-sky-500" />
                <span className="truncate flex-1 font-medium text-slate-700">
                  {fileFr.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Belum ada file FR
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky-200 p-6 transition-colors hover:bg-sky-50/50 w-full min-h-[120px] text-center overflow-hidden">
              <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                <UploadCloud className="mb-2 h-6 w-6 text-sky-400 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-xs font-medium text-sky-600">
                  Klik / Drop file FR (.csv)
                </p>
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

        {/* INPUT FILE BIOSTAR */}
        <Card className="border-sky-100 shadow-sm w-full h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">
                Mesin 2
              </span>
              Data Absensi Biostar
            </CardTitle>
            {fileBiostar ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-sky-50 p-2 rounded-md border border-sky-100">
                <FileText className="h-4 w-4 text-sky-500" />
                <span className="truncate flex-1 font-medium text-slate-700">
                  {fileBiostar.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Belum ada file Biostar
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky-200 p-6 transition-colors hover:bg-sky-50/50 w-full min-h-[120px] text-center overflow-hidden">
              <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                <UploadCloud className="mb-2 h-6 w-6 text-sky-400 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-xs font-medium text-sky-600">
                  Klik / Drop file Biostar (.csv)
                </p>
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

      {/* RENTANG WAKTU KUSTOM & TOMBOL PROSES */}
      <div className="relative flex flex-col items-center w-full my-6 p-6 bg-slate-50 border border-sky-100 rounded-xl shadow-sm">
        <span className="h-6 absolute right-[-4] top-[-4] flex items-center gap-1 bg-violet-100 text-violet-600 border border-violet-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          <Sparkles className="h-3 w-3" />
          New Feature
        </span>
        <div className="w-full md:w-1/2 mb-6">
          {/* LABEL DENGAN TAG NEW FEATURE */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-500" />
              Tentukan Rentang Waktu Ricap
            </Label>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block text-center">
                Dari Jam
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isPending}
                className="text-center bg-white border-sky-200 focus-visible:ring-sky-500"
              />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 mt-5" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block text-center">
                Sampai Jam
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isPending}
                className="text-center bg-white border-sky-200 focus-visible:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleProcess}
          disabled={
            !fileFr || !fileBiostar || !startTime || !endTime || isPending
          }
          size="lg"
          className="bg-sky-600 hover:bg-sky-700 text-white w-full md:w-1/3 shadow-md h-12 text-md transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyatukan Data...
            </>
          ) : (
            <>
              <Layers className="mr-2 h-5 w-5" />
              Proses Rekap Waktu
            </>
          )}
        </Button>
      </div>

      {/* AREA HASIL REKAPITULASI */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* CARD 1: TOTAL SELURUH KARYAWAN */}
          <Card className="bg-cyan-500 text-white shadow-sm w-full">
            <CardHeader className="pb-2 border-b border-cyan-400/30">
              <CardTitle className="text-sm font-semibold uppercase flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Pegawai In/Masuk
                </span>
                <span className="text-[10px] bg-cyan-700 px-2 py-1 rounded opacity-90 border border-cyan-600">
                  {activeRangeLabel}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold mb-4">
                {stats.totalHadir.toLocaleString()}{" "}
                <span className="text-sm font-normal opacity-75">Orang</span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-cyan-600/50 p-3 rounded-lg text-sm">
                <div>
                  <div className="opacity-75 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Jakarta
                  </div>
                  <div className="font-bold text-xl">
                    {stats.hadirJakarta.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="opacity-75 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Karawang
                  </div>
                  <div className="font-bold text-xl">
                    {stats.hadirKarawang.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: TOTAL DIVISI PENGAMANAN */}
          <Card className="bg-teal-500 text-white shadow-sm w-full">
            <CardHeader className="pb-2 border-b border-teal-400/30">
              <CardTitle className="text-sm font-semibold uppercase flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Divisi Pengamanan
                </span>
                <span className="text-[10px] bg-teal-700 px-2 py-1 rounded opacity-90 border border-teal-600">
                  {activeRangeLabel}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold mb-4">
                {stats.totalSecurity.toLocaleString()}{" "}
                <span className="text-sm font-normal opacity-75">Personil</span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-teal-600/50 p-3 rounded-lg text-sm">
                <div>
                  <div className="opacity-75 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Jakarta
                  </div>
                  <div className="font-bold text-xl">
                    {stats.securityJakarta.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="opacity-75 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Karawang
                  </div>
                  <div className="font-bold text-xl">
                    {stats.securityKarawang.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TABEL REKAP PER-LINE */}
          <Card className="border-sky-100 shadow-sm md:col-span-2 w-full overflow-hidden mt-2">
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-500" />
                Jumlah Hadir Per-Line Operasional (Waktu: {activeRangeLabel})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-auto relative w-full">
                <Table className="w-full min-w-[400px]">
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="font-semibold w-12 text-center text-xs md:text-sm whitespace-nowrap">
                        No
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                        Area / Line
                      </TableHead>
                      <TableHead className="font-semibold text-right text-xs md:text-sm whitespace-nowrap">
                        Jumlah Pegawai
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.lineStats.map((line, i) => (
                      <TableRow
                        key={line.lineName}
                        className="hover:bg-sky-50/30"
                      >
                        <TableCell className="text-center text-muted-foreground text-xs md:text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 text-xs md:text-sm whitespace-nowrap">
                          {line.lineName}
                        </TableCell>
                        <TableCell className="text-right text-sky-600 font-bold text-xs md:text-sm">
                          {line.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
