import { jsPDF } from "jspdf";

const fontBase64 = `
PUT_BASE64_HERE
`;

try {
  // سجّل الخط في VFS
  jsPDF.API.addFileToVFS("Cairo-Regular.ttf", fontBase64);
  jsPDF.API.addFont("Cairo-Regular.ttf", "Cairo", "normal");
} catch (e) {
  console.warn("Failed to register Cairo font in jsPDF:", e);
}
