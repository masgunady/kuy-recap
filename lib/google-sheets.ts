import { google } from "googleapis";
import { normalizeNik } from "./nik-normalizer";

const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
        ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^"|"$/g, "")
        : undefined,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

const sheets = google.sheets({version: "v4", auth});

export async function getSecurityNiks(sheetname: "MORPHO" | "BIOSTAR"){
  try {

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetname}!A:A`
    });


    const rows = response.data.values
    if(!rows){
      return [];
    }


    return rows.map((row) => row[0]?.trim()).filter((val) => val && val.toLowerCase() !== "np").map((val) => normalizeNik(val));
  } catch (error) {
    console.error(`Gagal mengambil data dari Sheet ${sheetname}:`, error);
  }
}

export async function getDoorMapping() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range:`PERANGKAT!A:B`,
    });

    const rows = response.data.values;
    if (!rows) return {}

    const mapping: Record<string, string> = {}

    rows.forEach((row, index) => {
      if (index === 0 && row[0]?.toLowerCase() === "door") return; 
      
      const doorName = row[0]?.trim();
      const lineName = row[1]?.trim(); 
      
      if (doorName && lineName) {
        mapping[doorName] = lineName;
      }
    });

    return mapping;
  } catch (error) {
    console.error("Gagal mengambil data mapping perangkat:", error);
    return{}
  }
}

