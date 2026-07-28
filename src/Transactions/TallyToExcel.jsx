import { useState } from "react";
import {
  Button,
  DisplayArea,
  InputJSONFile,
  InputXMLFile,
  Table,
  TableRow,
  WindowTitle,
} from "../Components";
import { TallyJSONToTable } from "../functions";
import { Window } from "../UserInterface";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export function TallyToExcel() {
  const [tabledata, setdata] = useState([]);

  const downloadFile = async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Transactions");
    sheet.columns = [
      { header: "Voucher", key: "Voucher", width: 30 },
      { header: "VoucherType", key: "VoucherType", width: 30 },
      { header: "Date", key: "Date", width: 30 },
      { header: "Narration", key: "Narration", width: 30 },
      { header: "Ledger", key: "Ledger", width: 30 },
      { header: "Amount", key: "Amount", width: 30 },
    ];
    tabledata.forEach((record) => {
      const { Voucher, VoucherType, Date, Amount, Ledger, Narration } = record;
      sheet.addRow({
        Voucher,
        VoucherType,
        Date,
        Narration,
        Ledger,
        Amount,
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "TallyTransactions.xlsx");
  };

  return (
    <>
      <WindowTitle
        title={"Tally Transactions to Excel"}
        menu={[
          <InputXMLFile
            title="Open"
            process={(value) => {
              setdata(TallyJSONToTable(value));
              downloadFile();
            }}
            handleError={(error) => showAlert(error)}
          />,
          <Button
            name={"Download Excel"}
            functionsArray={[() => downloadFile()]}
          />,
        ]}
      />
      <DisplayArea>
        <Table
          columns={["Voucher", "Type", "Date", "Narration", "Ledger", "Amount"]}
          rows={tabledata.map((item) => [
            <label>{item.Voucher}</label>,
            <label>{item.VoucherType}</label>,
            <label>{item.Date}</label>,
            <label>{item.Narration}</label>,
            <label>{item.Ledger}</label>,
            <label>{item.Amount}</label>,
          ])}
        />
      </DisplayArea>
    </>
  );
}
