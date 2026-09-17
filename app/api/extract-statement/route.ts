import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse CSV text directly
    let text = buffer.toString('utf-8');
    
    // DEBUG: Save the raw text to a file so the AI can read it
    import('fs').then(fs => fs.writeFileSync('parsed_csv_debug.txt', text));

    // Normalize newlines and replace typical CSV separators (like quotes around commas) if needed, 
    // but the regex will handle basic commas/semicolons in place of spaces.
    text = text.replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const transactions = [];
    
    let previousBalance: number | null = null;
    let pendingTx: { date: string, textBuffer: string } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Allow space, comma, or semicolon as separator after date
      const dateMatch = trimmed.match(/^(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})[\s,;]+(.*)/);
      if (dateMatch) {
          pendingTx = {
              date: dateMatch[1],
              textBuffer: dateMatch[2]
          };
      } else if (pendingTx) {
          pendingTx.textBuffer += " " + trimmed;
      } else {
          continue;
      }

      // Check if textBuffer now contains amounts
      const amountRegex = /([\d\,]+\.\d{2})/g;
      const amounts = pendingTx.textBuffer.match(amountRegex);
      
      if (!amounts || amounts.length < 2) {
          // Not enough amounts yet, might be on the next line
          continue;
      }

      const parseNum = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;
      
      let debit = 0;
      let credit = 0;
      let balance = 0;

      if (amounts.length >= 3) {
          debit = parseNum(amounts[amounts.length - 3]);
          credit = parseNum(amounts[amounts.length - 2]);
          balance = parseNum(amounts[amounts.length - 1]);
      } else {
          const amt = parseNum(amounts[0]);
          balance = parseNum(amounts[1]);
          if (pendingTx.textBuffer.toUpperCase().includes(' CR')) {
              credit = amt;
          } else if (pendingTx.textBuffer.toUpperCase().includes(' DB') || pendingTx.textBuffer.toUpperCase().includes('DEBET')) {
              debit = amt;
          } else {
              if (previousBalance !== null) {
                  if (balance > previousBalance + 0.01) {
                      credit = amt;
                  } else {
                      debit = amt;
                  }
              } else {
                  debit = amt;
              }
          }
      }

      previousBalance = balance;

      let descAndTeller = pendingTx.textBuffer;
      for (let i = amounts.length - 1; i >= Math.max(0, amounts.length - 3); i--) {
          const idx = descAndTeller.lastIndexOf(amounts[i]);
          if (idx !== -1) {
              descAndTeller = descAndTeller.substring(0, idx) + descAndTeller.substring(idx + amounts[i].length);
          }
      }
      // Replace commas or semicolons left over with spaces to allow the rest of the logic to work
      descAndTeller = descAndTeller.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim();

      const words = descAndTeller.split(' ');
      let teller = "-";
      let description = descAndTeller;

      for (let i = words.length - 1; i >= 0; i--) {
          const w = words[i];
          if (/^\d{4,8}$/.test(w) || w === '-') {
              teller = w;
              words.splice(i, 1);
              description = words.join(' ');
              break; 
          }
      }

      const timeStuckRegex = /^(\d{2}:\d{2}:\d{2})(.*)/;
      const timeMatch = description.match(timeStuckRegex);
      if (timeMatch) {
          description = timeMatch[2].trim();
      } else {
          if (/^\d{2}:\d{2}:\d{2}$/.test(words[0])) {
              description = description.replace(words[0], '').trim();
          }
      }
      
      description = description.replace(/\s+(DB|CR)$/i, '').trim();

      let [dd, mm, yy] = pendingTx.date.split(/[\/\-]/);
      if (yy && yy.length === 2) yy = '20' + yy;
      const dateFormatted = `${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;

      const descUpper = description.toUpperCase();
      let category = "Lain-lain";
      if (descUpper.includes("BUNGA") || descUpper.includes("INTEREST")) category = "Pendapatan Bunga";
      else if (descUpper.includes("PAJAK") || descUpper.includes("TAX")) category = "Pajak";
      else if (descUpper.includes("ADMIN") || descUpper.includes("FEE")) category = "Biaya Admin";
      else if (descUpper.includes("GAJI") || descUpper.includes("PAYROLL")) category = "Gaji";

      transactions.push({
        date: dateFormatted,
        description: description,
        teller: teller,
        debit: debit,
        credit: credit,
        balance: balance,
        category: category
      });
      
      // Finalized, clear pendingTx
      pendingTx = null;
    }

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("Local CSV Parsing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
