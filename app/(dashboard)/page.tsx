"use client";

import { useState, useTransition } from "react";
import { processFrCsv } from "@/app/actions/fr-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  UploadCloud,
  Users,
  CheckSquare,
  Activity,
  Loader2,
  FileText,
} from "lucide-react";

type StatsType = {
  totalKaryawan: number;
  totalRawRows: number;
  doorStats: { doorName: string; total: number }[];
  previewData: Record<string, string>[];
};

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Persiapkan data file ke form-data untuk Server Action
    const formData = new FormData();
    formData.append("file", file);

    // Jalankan Server Action
    startTransition(async () => {
      const result = await processFrCsv(formData);

      if (result.success) {
        setStats({
          totalKaryawan: result.totalKaryawan!,
          totalRawRows: result.totalRawRows!,
          doorStats: result.doorStats!,
          previewData: result.previewData!,
        });
      } else {
        console.error("Gagal memproses file", result.error);
        setFileName(null);
      }
    });

    e.target.value = ""; // Reset input
  };

  return (
    <main className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Kuy<span className="text-cyan-500">ReCap</span> (FR Mode)
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* INPUT SECTION */}
        <Card className="md:col-span-3 border-cyan-100 shadow-sm h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg">
              Upload Data Absensi FR
            </CardTitle>
            {fileName ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-cyan-50 p-2 rounded-md border border-cyan-100">
                <FileText className="h-4 w-4 text-cyan-500" />
                <span
                  className="truncate flex-1 font-medium text-slate-700"
                  title={fileName}
                >
                  {fileName}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Belum ada file yang dipilih
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>File CSV</Label>
              <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-200 p-6 md:p-8 transition-colors hover:bg-cyan-50/50 w-full min-h-[160px] text-center overflow-hidden">
                <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                  {isPending ? (
                    <Loader2 className="mb-2 h-8 w-8 text-cyan-400 animate-spin" />
                  ) : (
                    <UploadCloud className="mb-2 h-8 w-8 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <p className="text-xs md:text-sm font-medium text-cyan-600 text-center mt-2 px-2">
                    {isPending
                      ? "Sedang memproses di Server..."
                      : "Klik atau Drop file FR (.csv)"}
                  </p>
                </div>

                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20 file:cursor-pointer"
                />
                {/* <p className="text-sm font-medium text-cyan-600 text-center mt-2">
                  {isPending
                    ? "Sedang memproses di Server..."
                    : "Klik atau Drop file FR (.csv)"}
                </p> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REKAP SECTION */}
        <div className="md:col-span-4 space-y-4 min-w-0 w-full">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-cyan-500 text-white shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase opacity-90">
                  Total Karyawan In/Masuk (Unik)
                </CardTitle>
                <Users className="h-4 w-4 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  {stats ? stats.totalKaryawan.toLocaleString() : "0"}
                </div>
                <p className="text-xs opacity-75 mt-1">
                  Setelah hapus anomali / duplikasi (Double Entry)
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-100 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                  Total Baris Raw Data
                </CardTitle>
                <Activity className="h-4 w-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">
                  {stats ? stats.totalRawRows.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baris transaksi dibaca sistem
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TABEL REKAP PER-DOOR */}
          <Card className="border-cyan-100 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <CardTitle className="text-xs flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-cyan-500" />
                Rekap Jumlah Karyawan Per-DOOR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[350px] overflow-auto relative w-full">
                {stats && stats.doorStats.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="text-xs font-semibold w-12 text-center">
                          No
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Perangkat (DOOR)
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Jumlah Karyawan
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.doorStats.map((door, i) => (
                        <TableRow
                          key={door.doorName}
                          className="hover:bg-cyan-50/30"
                        >
                          <TableCell className="text-xs text-center text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-700">
                            {door.doorName}
                          </TableCell>
                          <TableCell className="text-xs text-center text-cyan-600 font-bold">
                            {door.total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-10 text-center text-muted-foreground italic text-sm">
                    Silakan upload file untuk melihat data perangkat.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
