declare module "jspdf-autotable" {
  import jsPDF from "jspdf";
  interface UserOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: "striped" | "grid" | "plain";
    styles?: any;
    headStyles?: any;
    didDrawPage?: (data: any) => void;
  }
  function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
  export default autoTable;
}