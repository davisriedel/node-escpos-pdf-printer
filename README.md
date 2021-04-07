# node-escpos-pdf-printer

## Description

This library allows to use the same syntax used by [node-escpos](https://github.com/song940/node-escpos) to print a PDF receipt.
It uses [pdfmake](https://pdfmake.github.io/docs/0.1/) to generate the PDF, this is the only dependency. The library is written in TypeScript.

## WORK IN PROGRESS

This is a work in progress. Not all features of [node-escpos](https://github.com/song940/node-escpos) are implemented!

## Scope

In some countries like Germany you are required to hand out a receipt with every transaction.
To save paper and keep costs low, you can also provide a digital receipt, often provided via a QR-Code.
With this library you do not need to implement another logic for generating PDF receipts. You can just swap the ```escpos.Printer``` class
provided by [node-escpos](https://github.com/song940/node-escpos) with the ```PDFPrinter``` class provided by this library.

## Usage

Have a look at the following example from [node-escpos](https://github.com/song940/node-escpos):

```
const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');
// Select the adapter based on your printer type
const device  = new escpos.USB();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const options = { encoding: "GB18030" /* default */ }
// encoding is optional

const printer = new escpos.Printer(device, options);

device.open(function(error){
  printer
  .font('a')
  .align('ct')
  .style('bu')
  .size(1, 1)
  .text('The quick brown fox jumps over the lazy dog')
  .text('敏捷的棕色狐狸跳过懒狗')
  .barcode('1234567', 'EAN8')
  .table(["One", "Two", "Three"])
  .tableCustom(
    [
      { text:"Left", align:"LEFT", width:0.33, style: 'B' },
      { text:"Center", align:"CENTER", width:0.33},
      { text:"Right", align:"RIGHT", width:0.33 }
    ],
    { encoding: 'cp857', size: [1, 1] } // Optional
  )
  .qrimage('https://github.com/song940/node-escpos', function(err){
    this.cut();
    this.close();
  });
});
```

To print a PDF you can simply modify your existing code as shown below:

```
const escpos = require('escpos');

const PDFPrinter = require('node-escpos-pdf-printer');

// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');
// Select the adapter based on your printer type
const device  = new escpos.USB();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const options = { encoding: "GB18030" /* default */ }
// encoding is optional

const printAsPDF = true;

function print(printer) {
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(1, 1)
      .text('The quick brown fox jumps over the lazy dog')
      .text('敏捷的棕色狐狸跳过懒狗')
      .barcode('1234567', 'EAN8')
      .table(["One", "Two", "Three"])
      .tableCustom(
        [
          { text:"Left", align:"LEFT", width:0.33, style: 'B' },
          { text:"Center", align:"CENTER", width:0.33},
          { text:"Right", align:"RIGHT", width:0.33 }
        ],
        { encoding: 'cp857', size: [1, 1] } // Optional
      )
      .qrimage('https://github.com/song940/node-escpos', function(err){
        this.cut();
        this.close();
      });
}

var printer;

if (printAsPDF) {
    printer = new PDFPrinter(options);
    print(printer);
} else {
    printer = new escpos.Printer(device, options);
    device.open(function(error) {
      print(printer);
    });
}
```
