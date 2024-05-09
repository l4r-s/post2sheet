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

export async function isFirstRowPopulated({
  token,
  sheetId,
  range = "A1:Z1",
}: {
  token: string;
  sheetId: string;
  range?: string;
}): Promise<{ populated: boolean; error?: string }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    return {
      populated: false,
      error: JSON.stringify(errorData) || "Unknown error",
    };
  }

  const data = await response.json();
  const firstRowValues = data.values ? data.values[0] : [];
  const populated = firstRowValues.some((cell: string) => cell.trim() !== "");

  return {
    populated,
  };
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
