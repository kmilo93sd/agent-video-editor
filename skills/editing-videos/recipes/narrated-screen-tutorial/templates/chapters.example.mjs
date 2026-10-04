export const chapterId = (ch) => `ch${ch}`;

export const chapters = [
  {
    ch: "00",
    title: "Opening",
    vo:
      "This is the report for a month that is already closed, with its twelve transactions reconciled. We are going to get here " +
      "from scratch: load the bank statement, review what the system suggests and close the month.",
    anchors: ["This is the report", "We are going to get here"],
  },
  {
    ch: "01",
    title: "Load the bank statement",
    vo:
      "In Banking, the Upload statement button opens the file picker. The file your bank exports in " +
      "C S V format works as is. Once you upload it, the table shows each transaction with its date and its amount.",
    anchors: ["In Banking", "The file your bank exports", "Once you upload it"],
    visuals: [{ anchor: "each transaction" }],
  },
];
