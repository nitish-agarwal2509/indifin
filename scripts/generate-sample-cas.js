const PDFDocument = require("pdfkit");
const fs = require("fs");

const doc = new PDFDocument({ size: "A4", margin: 50 });
const output = fs.createWriteStream("sample-cas.pdf");
doc.pipe(output);

const BLUE = "#1a73e8";
const PURPLE = "#6b5ce7";
const GRAY = "#666666";
const BLACK = "#000000";
const LIGHT_GRAY = "#f5f5f5";

let pageNum = 1;
const totalPages = 8;

function addHeader() {
  doc.fontSize(16).fillColor(BLUE).text("Consolidated Account Statement", 120, 40, { align: "center" });
  doc.fontSize(9).fillColor(BLUE).text("( From Date : 01-Jan-2024", 120, 62, { continued: true, align: "center" });
  doc.text("       To Date : 01-Jan-2025 )", { align: "center" });
  doc.moveDown(0.5);

  // Tab bar
  const tabY = 95;
  doc.rect(50, tabY, 250, 25).fill("#d0d0e8");
  doc.rect(300, tabY, 250, 25).fill(PURPLE);
  doc.fontSize(9).fillColor(GRAY).text("SoA Holdings", 100, tabY + 7);
  doc.fillColor("white").text("Demat Holdings", 360, tabY + 7);
  doc.fillColor(BLACK);

  // Column headers
  const colY = 130;
  doc.rect(50, colY, 500, 20).fill(LIGHT_GRAY);
  doc.fontSize(8).fillColor(BLACK);
  doc.text("Date", 55, colY + 5);
  doc.text("Transaction", 160, colY + 5);
  doc.text("Amount (INR)", 310, colY + 5);
  doc.text("Units", 390, colY + 5);
  doc.text("Price (INR)", 440, colY + 5);
  doc.text("Unit Balance", 500, colY + 5);

  return colY + 25;
}

function addFooter() {
  doc.fontSize(6).fillColor(GRAY);
  doc.text(`MFCentralDetailCAS_v1.2_SAMPLE_01-Jan-2024_01-Jan-2025_-01/01/2025 4:30:00pm`, 50, 770);
  doc.text(`Page ${pageNum} of ${totalPages}`, 480, 770);
  pageNum++;
}

function newPage() {
  addFooter();
  doc.addPage();
  return addHeader();
}

function addTransaction(y, date, desc, amount, units, nav, balance) {
  if (y > 740) {
    y = newPage();
  }
  doc.fontSize(7.5).fillColor(BLACK);
  doc.text(date, 55, y);
  doc.text(desc, 130, y);
  if (amount !== null) {
    const amtStr = amount < 0 ? `(${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })})` : amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    doc.text(amtStr, 300, y, { width: 70, align: "right" });
  }
  if (units !== null) {
    const unitStr = units < 0 ? `(${Math.abs(units).toFixed(3)})` : units.toFixed(3);
    doc.text(unitStr, 380, y, { width: 45, align: "right" });
  }
  if (nav !== null) doc.text(nav.toFixed(2), 435, y, { width: 45, align: "right" });
  if (balance !== null) doc.text(balance.toLocaleString("en-IN", { minimumFractionDigits: 3 }), 490, y, { width: 60, align: "right" });
  return y + 14;
}

function addSchemeHeader(y, amc, folio, schemeName, isin, openingBalance) {
  if (y > 700) {
    y = newPage();
  }
  doc.fontSize(11).font("Helvetica-Bold").fillColor(BLACK).text(amc, 55, y);
  y += 18;
  doc.fontSize(8).font("Helvetica-Bold").text(`FOLIO NO: ${folio}`, 55, y);
  y += 14;
  doc.fontSize(7.5).font("Helvetica").fillColor(BLACK);
  doc.text(`${schemeName} (Advisor: INZ000031633/ZERODHA BROKING LIMITED  ISIN: ${isin}`, 55, y, { width: 400 });
  doc.text(`Opening Unit Balance: ${openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 3 })}`, 400, y, { width: 150, align: "right" });
  y += 20;
  return y;
}

function addClosingLine(y, closingUnits, nav, navDate, valuation) {
  if (y > 740) {
    y = newPage();
  }
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(BLACK);
  doc.text(`Closing Unit Balance: ${closingUnits.toLocaleString("en-IN", { minimumFractionDigits: 3 })}`, 55, y);
  doc.text(`Nav as on ${navDate}: INR ${nav.toFixed(4)}`, 230, y);
  doc.text(`Valuation on 01-Jan-2025 : INR ${valuation}`, 400, y);
  doc.font("Helvetica");
  return y + 25;
}

// ===== PAGE 1: Investor Details =====
doc.fontSize(16).fillColor(BLUE).text("Consolidated Account Statement", { align: "center" });
doc.fontSize(9).fillColor(BLUE).text("( From Date : 01-Jan-2024       To Date : 01-Jan-2025 )", { align: "center" });
doc.moveDown(1.5);

doc.fontSize(9).fillColor(BLACK);
doc.text("PAN: BXZPK5678L");
doc.text("Amit Verma", { fillColor: BLUE });
doc.moveDown(0.3);
doc.text("Amit Verma 42-B Green Park Apartments");
doc.text("Sector 56 Gurgaon");
doc.text("GURGAON - 122011, HARYANA, INDIA");
doc.text("Mobile: 9876543210");
doc.text("Email: AMIT.VERMA@EXAMPLE.COM");

doc.moveDown(1);
doc.text("The Consolidated Account Statement is brought to you as an investor friendly initiative by CAMS and KFintech, and list the transactions, balances and valuation of Mutual Funds in which you are holding investments. The consolidation has been carried out based on your PAN.", { width: 450 });

doc.moveDown(2);
// Tab bar
const tabY1 = 320;
doc.rect(50, tabY1, 250, 25).fill("#d0d0e8");
doc.rect(300, tabY1, 250, 25).fill(PURPLE);
doc.fontSize(9).fillColor(GRAY).text("SoA Holdings", 100, tabY1 + 7);
doc.fillColor("white").text("Demat Holdings", 360, tabY1 + 7);

doc.fontSize(12).fillColor(GRAY).text("No Folios Found", 220, 450);
addFooter();

// ===== PAGE 2: Allocation Chart placeholder =====
doc.addPage();
let y = addHeader();
doc.fontSize(12).fillColor(BLACK).text("Allocation by Asset Class", 180, 180);
doc.fontSize(10).fillColor(GRAY).text("85.12% - EQUITY", 220, 220);
doc.fontSize(10).text("8.45% - DEBT", 220, 240);
doc.fontSize(10).text("6.43% - Equity (Small Cap)", 220, 260);
addFooter();

// ===== PAGE 3+: Scheme 1 - Mirae Asset Large Cap Fund =====
doc.addPage();
y = addHeader();

y = addSchemeHeader(y, "Mirae Asset Mutual Fund", "30145678",
  "Mirae Asset Large Cap Fund - Direct Plan Growth", "INF769K01AX2", 850.432);

// Generate monthly SIP transactions for 2024
const scheme1Txns = [];
let balance1 = 850.432;
const dates1 = [
  "05-JAN-2024", "05-FEB-2024", "05-MAR-2024", "05-APR-2024",
  "06-MAY-2024", "05-JUN-2024", "05-JUL-2024", "05-AUG-2024",
  "05-SEP-2024", "07-OCT-2024", "05-NOV-2024", "05-DEC-2024"
];
const navs1 = [105.23, 107.45, 109.12, 111.67, 108.34, 112.89, 115.42, 113.78, 117.56, 119.23, 116.89, 120.45];

for (let i = 0; i < 12; i++) {
  const amount = 5000;
  const units = parseFloat((amount / navs1[i]).toFixed(3));
  balance1 = parseFloat((balance1 + units).toFixed(3));
  scheme1Txns.push({ date: dates1[i], desc: "Purchase", amount, units, nav: navs1[i], balance: balance1 });
}

// Add a redemption in July
const redeemUnits = -25.000;
const redeemNav = 115.42;
const redeemAmt = parseFloat((redeemUnits * redeemNav).toFixed(2));
balance1 = parseFloat((balance1 + redeemUnits).toFixed(3));
scheme1Txns.splice(7, 0, {
  date: "15-JUL-2024",
  desc: "REDEMPTION - Direct Credit @ SBI Bank",
  amount: redeemAmt,
  units: redeemUnits,
  nav: redeemNav,
  balance: balance1
});
// Recalculate subsequent balances
for (let i = 8; i < scheme1Txns.length; i++) {
  if (scheme1Txns[i].units > 0) {
    balance1 = parseFloat((balance1 + scheme1Txns[i].units).toFixed(3));
    scheme1Txns[i].balance = balance1;
  }
}

for (const tx of scheme1Txns) {
  y = addTransaction(y, tx.date, tx.desc, tx.amount, tx.units, tx.nav, tx.balance);
}

const closing1 = balance1;
y = addClosingLine(y, closing1, 121.3456, "31-DEC-2024", "1,28,543.67");

// ===== Scheme 2 - HDFC Nifty 50 Index Fund =====
y = addSchemeHeader(y, "HDFC Mutual Fund", "45678901",
  "HDFC Index Fund - Nifty 50 Plan - Direct Plan Growth", "INF179K01BE2", 5240.125);

let balance2 = 5240.125;
const navs2 = [215.34, 218.67, 222.45, 225.12, 220.89, 228.56, 232.78, 229.34, 235.67, 238.12, 234.56, 240.23];

for (let i = 0; i < 12; i++) {
  const amount = 10000;
  const units = parseFloat((amount / navs2[i]).toFixed(3));
  balance2 = parseFloat((balance2 + units).toFixed(3));
  y = addTransaction(y, dates1[i], "Purchase - INZ000031633", amount, units, navs2[i], balance2);
}

// Add lumpsum
const lumpNav = 230.45;
const lumpUnits = parseFloat((100000 / lumpNav).toFixed(3));
balance2 = parseFloat((balance2 + lumpUnits).toFixed(3));
y = addTransaction(y, "15-AUG-2024", "Purchase - INZ000031633", 100000, lumpUnits, lumpNav, balance2);

y = addClosingLine(y, balance2, 241.5678, "31-DEC-2024", "16,45,234.89");

// ===== Scheme 3 - SBI Corporate Bond Fund =====
y = addSchemeHeader(y, "SBI Mutual Fund", "78901234",
  "SBI Corporate Bond Fund - Direct Growth", "INF200K01RJ1", 0);

const bondNav = 15.67;
const bondUnits = parseFloat((500000 / bondNav).toFixed(3));
y = addTransaction(y, "10-MAR-2024", "Purchase", 500000, bondUnits, bondNav, bondUnits);
const bondNav2 = 15.89;
const bondUnits2 = parseFloat((200000 / bondNav2).toFixed(3));
const bondBal = parseFloat((bondUnits + bondUnits2).toFixed(3));
y = addTransaction(y, "20-AUG-2024", "Purchase", 200000, bondUnits2, bondNav2, bondBal);

y = addClosingLine(y, bondBal, 16.2345, "31-DEC-2024", "7,42,156.78");

// ===== Scheme 4 - Axis Small Cap Fund =====
y = addSchemeHeader(y, "Axis Mutual Fund", "99012345",
  "Axis Small Cap Fund Direct Growth", "INF846K01K35", 320.150);

let balance4 = 320.150;
const navs4 = [82.34, 84.56, 86.12, 88.45, 85.67, 90.23, 92.78, 91.12, 94.56, 96.34, 93.45, 97.89];

for (let i = 0; i < 12; i++) {
  const amount = 2500;
  const units = parseFloat((amount / navs4[i]).toFixed(3));
  balance4 = parseFloat((balance4 + units).toFixed(3));
  y = addTransaction(y, dates1[i], "Purchase", amount, units, navs4[i], balance4);
}

y = addClosingLine(y, balance4, 98.4532, "31-DEC-2024", "65,432.18");

// Add final footer and disclaimer
if (y > 700) {
  addFooter();
  doc.addPage();
  y = 50;
}
doc.moveDown(2);
doc.fontSize(7).fillColor(GRAY);
doc.text("#IDCW - Income Distribution cum Capital Withdrawal", 55, y + 10);
doc.text("*SoA - Statement of Account", 55, y + 20);
addFooter();

doc.end();

output.on("finish", () => {
  console.log("Sample CAS PDF generated: sample-cas.pdf");
});
