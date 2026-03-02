import { google } from "googleapis";

export async function getSecurityNiks(sheetname: "MORPHO" | "BIOSTAR"){
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,"n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });


    const sheets = google.sheets({version: "v4", auth});
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetname}!A:A`
    });


    const rows = response.data.values
    if(!rows){
      return [];
    }

    return rows.map((row) => row[0]?.trim()).filter((val) => val && val.toLowerCase() !== "np");
  } catch (error) {
    console.error(`Gagal mengambil data dari Sheet ${sheetname}:`, error);
  }
}