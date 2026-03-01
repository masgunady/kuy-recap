"use client";

import { useState, useTransition } from "react";
import { processBiostarCsv } from "@/app/actions/bio-action";
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

export default function BiostarPage() {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await processBiostarCsv(formData);

      if (result.success) {
        setStats({
          totalKaryawan: result.totalKaryawan!,
          totalRawRows: result.totalRawRows!,
          doorStats: result.doorStats!,
          previewData: result.previewData!,
        });
      } else {
        console.error("Gagal memproses file Biostar", result.error);
        setFileName(null);
      }
    });

    e.target.value = "";
  };

  return (
    <main className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Kuy<span className="text-teal-500">ReCap</span> (Biostar)
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-7 w-full">
        {/* INPUT SECTION */}
        <Card className="md:col-span-3 border-teal-100 shadow-sm h-fit w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg">
              Upload Data Absensi Tap Card
            </CardTitle>
            {fileName ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-teal-50 p-2 rounded-md border border-teal-100">
                <FileText className="h-4 w-4 text-teal-500" />
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
              <Label className="text-sm">Pilih File Baru</Label>
              <div className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-200 p-6 md:p-8 transition-colors hover:bg-teal-50/50 w-full min-h-[160px] text-center overflow-hidden">
                <div className="flex flex-col items-center justify-center pointer-events-none z-10">
                  {isPending ? (
                    <Loader2 className="mb-2 h-8 w-8 text-teal-400 animate-spin" />
                  ) : (
                    <UploadCloud className="mb-2 h-8 w-8 text-teal-400 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <p className="text-xs md:text-sm font-medium text-teal-600 text-center mt-2 px-2">
                    {isPending
                      ? "Sedang memproses di Server..."
                      : "Klik atau Drop file Biostar (.csv)"}
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20 file:cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REKAP SECTION */}
        <div className="md:col-span-4 space-y-4 min-w-0 w-full">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card className="bg-teal-500 text-white shadow-sm w-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium uppercase opacity-90">
                  Karyawan Masuk (Unik)
                </CardTitle>
                <Users className="h-4 w-4 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  {stats ? stats.totalKaryawan.toLocaleString() : "0"}
                </div>
                <p className="text-[10px] md:text-xs opacity-75 mt-1">
                  Setelah hapus duplikasi & status valid
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-100 shadow-sm w-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium uppercase text-muted-foreground">
                  Total Baris Raw
                </CardTitle>
                <Activity className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-teal-600">
                  {stats ? stats.totalRawRows.toLocaleString() : "0"}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Seluruh baris transaksi (No Filter)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TABEL REKAP PER-DOOR */}
          <Card className="border-teal-100 shadow-sm w-full overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-teal-500" />
                Rekap Per-DOOR (Biostar)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[350px] overflow-auto relative w-full">
                {stats && stats.doorStats.length > 0 ? (
                  <Table className="w-full min-w-[300px]">
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="font-semibold w-12 text-center text-xs md:text-sm whitespace-nowrap">
                          No
                        </TableHead>
                        <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                          Perangkat (DOOR)
                        </TableHead>
                        <TableHead className="font-semibold text-right text-xs md:text-sm whitespace-nowrap">
                          Jumlah Karyawan
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.doorStats.map((door, i) => (
                        <TableRow
                          key={door.doorName}
                          className="hover:bg-teal-50/30"
                        >
                          <TableCell className="text-center text-muted-foreground text-xs md:text-sm">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700 text-xs md:text-sm whitespace-nowrap">
                            {door.doorName}
                          </TableCell>
                          <TableCell className="text-right text-teal-600 font-bold text-xs md:text-sm">
                            {door.total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 md:p-10 text-center text-muted-foreground italic text-xs md:text-sm">
                    Silakan upload file untuk melihat data perangkat Biostar.
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
