interface AddRowToGoogleSheetInput {
  token: string;
  sheetId: string;
  range: string;
  values: any[][];
}

interface AddRowToGoogleSheetResponse {
  message: string | null;
  error: string | null;
  failed: boolean;
}

export async function addRowToGoogleSheet({
  token,
  sheetId,
  range,
  values,
}: AddRowToGoogleSheetInput): Promise<AddRowToGoogleSheetResponse> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return {
      message: null,
      error: JSON.stringify(errorData) || "Unknown error",
      failed: true,
    };
  }

  return {
    message: "Row added",
    error: null,
    failed: false,
  };
}
