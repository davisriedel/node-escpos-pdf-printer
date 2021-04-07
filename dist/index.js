"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pdfmake_1 = __importDefault(require("pdfmake"));
var fs_1 = __importDefault(require("fs"));
var TextAlignment;
(function (TextAlignment) {
    TextAlignment["LEFT"] = "LT";
    TextAlignment["RIGHT"] = "RT";
    TextAlignment["CENTER"] = "CT";
})(TextAlignment || (TextAlignment = {}));
var PDFPrinter = /** @class */ (function () {
    function PDFPrinter(options) {
        this.doc = [];
        this.styles = {
            font: "AnkaCoder",
            fontSize: 12,
            bold: false,
            italics: false,
            alignment: "left",
            decoration: "",
            characterSpacing: 1,
            lineHeight: 1,
            preserveLeadingSpaces: true
        };
        this.alignment = TextAlignment.LEFT;
        this.options = options;
        this.width = options && options.width || 48;
    }
    PDFPrinter.prototype.close = function () {
        var fonts = {
            RobotoMono: {
                normal: './fonts/RobotoMono-Regular.ttf',
                bold: './fonts/RobotoMono-Bold.ttf',
                italics: './fonts/RobotoMono-Italic.ttf',
                bolditalics: './fonts/RobotoMono-BoldItalic.ttf'
            },
            // TODO: Maybe select another font in the future
            AnkaCoder: {
                normal: './fonts/AnkaCoder/AnkaCoder-r.ttf',
                bold: './fonts/AnkaCoder/AnkaCoder-b.ttf',
                italics: './fonts/AnkaCoder/AnkaCoder-i.ttf',
                bolditalics: './fonts/AnkaCoder/AnkaCoder-bi.ttf'
            },
            AnkaCoderNarrow: {
                normal: './fonts/AnkaCoderNarrow/AnkaCoder-C75-r.ttf',
                bold: './fonts/AnkaCoderNarrow/AnkaCoder-C75-b.ttf',
                italics: './fonts/AnkaCoderNarrow/AnkaCoder-C75-i.ttf',
                bolditalics: './fonts/AnkaCoderNarrow/AnkaCoder-C75-bi.ttf'
            }
        };
        var printer = new pdfmake_1.default(fonts);
        var docDefinition = { content: this.doc };
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs_1.default.createWriteStream('./pdf-out/test.pdf'));
        pdfDoc.end();
    };
    PDFPrinter.prototype.printToDoc = function (content) {
        var docEntry = this.doc[this.doc.length - 1];
        if (this.doc.length > 0 && docEntry.hasOwnProperty("text")) {
            docEntry.text.push(__assign({ text: content }, this.styles));
            return this;
        }
        this.doc.push({ text: [__assign({ text: content }, this.styles)] });
    };
    PDFPrinter.prototype.printAlignedText = function (text, align) {
        var secondLineEnabled = false;
        var tooLong = false;
        var textLength = text.length;
        text = text.toString();
        var originalText = text;
        if (textLength > this.width) {
            tooLong = true;
            text = text.substring(0, this.width);
        }
        var spaces = 0;
        switch (align) {
            case TextAlignment.CENTER:
                spaces = (this.width - textLength) / 2;
                this.printToDoc(' '.repeat(spaces));
                this.printToDoc(text);
                this.printToDoc(' '.repeat(spaces - 1));
                break;
            case TextAlignment.RIGHT:
                spaces = this.width - textLength;
                this.printToDoc(' '.repeat(spaces));
                this.printToDoc(text);
                break;
            case TextAlignment.LEFT:
            default:
                this.printToDoc(text);
        }
        if (tooLong) {
            secondLineEnabled = true;
            text = originalText.substring(this.width);
        }
        else {
            text = '';
        }
        // Writes second line if has
        if (secondLineEnabled)
            this.printAlignedText(text, align);
    };
    PDFPrinter.prototype.print = function (content) {
        this.printAlignedText(content, this.alignment);
        return this;
    };
    PDFPrinter.prototype.newLine = function () {
        this.printToDoc("\n");
        this.doc.push({ text: [] });
        return this;
    };
    PDFPrinter.prototype.println = function (content) {
        this.print(content);
        this.newLine();
        return this;
    };
    PDFPrinter.prototype.text = function (content, encoding) {
        this.println(content);
        return this;
    };
    PDFPrinter.prototype.pureText = function (content, encoding) {
        this.print(content);
        return this;
    };
    PDFPrinter.prototype.drawLine = function () {
        this.printToDoc("-".repeat(this.width));
        this.newLine();
        return this;
    };
    PDFPrinter.prototype.table = function (data) {
        var cellWidth = this.width / data.length;
        var lineTxt = "";
        for (var i = 0; i < data.length; i++) {
            lineTxt += data[i].toString();
            var spaces = cellWidth - data[i].toString().length;
            for (var j = 0; j < spaces; j++) {
                lineTxt += " ";
            }
        }
        this.println(lineTxt);
        return this;
    };
    PDFPrinter.prototype.tableCustom = function (data, options) {
        options = options || { size: [] };
        var _a = options.size || [], _b = _a[0], width = _b === void 0 ? 1 : _b, _c = _a[1], height = _c === void 0 ? 1 : _c;
        var baseWidth = Math.round(this.width / width);
        var cellWidth = Math.round(baseWidth / data.length);
        var leftoverSpace = baseWidth - cellWidth * data.length;
        var secondLineEnabled = false;
        var secondLine = [];
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            var align = (obj.align || '').toUpperCase();
            var tooLong = false;
            obj.text = obj.text.toString();
            var textLength = obj.text.length;
            if (obj.width) {
                cellWidth = Math.round(baseWidth * obj.width);
            }
            else if (obj.cols) {
                cellWidth = Math.round(obj.cols);
            }
            if (cellWidth < textLength) {
                tooLong = true;
                obj.originalText = obj.text;
                obj.text = obj.text.substring(0, cellWidth);
            }
            if (align === 'CENTER') {
                var spaces = Math.round((cellWidth - textLength) / 2);
                this.printToDoc(' '.repeat(spaces));
                if (obj.text !== '') {
                    if (obj.style)
                        this.style(obj.style);
                    this.printToDoc(obj.text);
                    this.style("NORMAL");
                }
                this.printToDoc(' '.repeat(spaces - 1));
            }
            else if (align === 'RIGHT') {
                var spaces = Math.round(cellWidth - textLength);
                if (leftoverSpace > 0) {
                    spaces += leftoverSpace;
                    leftoverSpace = 0;
                }
                this.printToDoc(' '.repeat(spaces));
                if (obj.text !== '') {
                    if (obj.style)
                        this.style(obj.style);
                    this.printToDoc(obj.text);
                    this.style("NORMAL");
                }
            }
            else {
                if (obj.text !== '') {
                    if (obj.style)
                        this.style(obj.style);
                    this.printToDoc(obj.text);
                    this.style("NORMAL");
                }
                var spaces = Math.round(cellWidth - textLength);
                if (leftoverSpace > 0) {
                    spaces += leftoverSpace;
                    leftoverSpace = 0;
                }
                this.printToDoc(' '.repeat(spaces));
            }
            if (tooLong) {
                secondLineEnabled = true;
                obj.text = obj.originalText.substring(cellWidth);
                secondLine.push(obj);
            }
            else {
                obj.text = '';
                secondLine.push(obj);
            }
        }
        // Writes second line if has
        if (secondLineEnabled)
            return this.tableCustom(secondLine, options);
        return this;
    };
    PDFPrinter.prototype.feed = function (n) {
        if (n === void 0) { n = 1; }
        this.print("\n".repeat(n || 1));
        return this;
    };
    PDFPrinter.prototype.align = function (alignment) {
        this.alignment = TextAlignment[alignment];
        return this;
    };
    PDFPrinter.prototype.font = function (family) {
        switch (family.toUpperCase()) {
            case "B":
                this.styles.font = "AnkaCoderNarrow";
                this.width = this.options && this.options.width || 32;
                break;
            case "A":
            default:
                this.styles.font = "AnkaCoder";
                this.width = this.options && this.options.width || 42;
        }
        return this;
    };
    PDFPrinter.prototype.style = function (type) {
        switch (type.toUpperCase()) {
            case 'B':
                this.styles.bold = true;
                this.styles.italics = false;
                this.styles.decoration = "";
                break;
            case 'I':
                this.styles.bold = false;
                this.styles.italics = true;
                this.styles.decoration = "";
                break;
            case 'U':
                this.styles.bold = false;
                this.styles.italics = false;
                this.styles.decoration = "underline";
                break;
            case 'U2':
                this.styles.bold = false;
                this.styles.italics = false;
                this.styles.decoration = "double";
                break;
            case 'BI':
                this.styles.bold = true;
                this.styles.italics = true;
                this.styles.decoration = "";
                break;
            case 'BIU':
                this.styles.bold = true;
                this.styles.italics = true;
                this.styles.decoration = "underline";
                break;
            case 'BIU2':
                this.styles.bold = true;
                this.styles.italics = true;
                this.styles.decoration = "double";
                break;
            case 'BU':
                this.styles.bold = true;
                this.styles.italics = false;
                this.styles.decoration = "underline";
                break;
            case 'BU2':
                this.styles.bold = true;
                this.styles.italics = false;
                this.styles.decoration = "double";
                break;
            case 'IU':
                this.styles.bold = false;
                this.styles.italics = true;
                this.styles.decoration = "underline";
                break;
            case 'IU2':
                this.styles.bold = false;
                this.styles.italics = true;
                this.styles.decoration = "double";
                break;
            case 'NORMAL':
            default:
                this.styles.bold = false;
                this.styles.italics = false;
                this.styles.decoration = "";
                break;
        }
        return this;
    };
    PDFPrinter.prototype.size = function (width, height) {
        this.styles.fontSize = width; // TODO: How to handle width and height??
        return this;
    };
    PDFPrinter.prototype.spacing = function (n) {
        if (n === void 0) { n = 1; }
        this.styles.characterSpacing = n || 1;
        return this;
    };
    PDFPrinter.prototype.lineSpace = function (n) {
        if (n === void 0) { n = 1; }
        this.styles.lineHeight = n || 1;
        return this;
    };
    PDFPrinter.prototype.barcode = function (code) {
        // TODO: Implement printing barcode to pdf
        console.log("Function barcode not yet implemented on PDFPrinter");
        // options = options || {};
        // var width, height, position, font, includeParity;
        // // Backward compatibility
        // width = arguments[2];
        // if (typeof width === 'string' || typeof width === 'number') {
        //   width = arguments[2];
        //   height = arguments[3];
        //   position = arguments[4];
        //   font = arguments[5];
        // } else {
        //   width = options.width;
        //   height = options.height;
        //   position = options.position;
        //   font = options.font;
        //   includeParity = options.includeParity !== false; // true by default
        // }
        //
        // type = type || 'EAN13'; // default type is EAN13, may a good choice ?
        // var convertCode = String(code), parityBit = '', codeLength = '';
        // if (typeof type === 'undefined' || type === null) {
        //   throw new TypeError('barcode type is required');
        // }
        // if (type === 'EAN13' && convertCode.length !== 12) {
        //   throw new Error('EAN13 Barcode type requires code length 12');
        // }
        // if (type === 'EAN8' && convertCode.length !== 7) {
        //   throw new Error('EAN8 Barcode type requires code length 7');
        // }
        // if (this._model === 'qsprinter') {
        //   this.buffer.write(_.MODEL.QSPRINTER.BARCODE_MODE.ON);
        // }
        // if (this._model === 'qsprinter') {
        //   // qsprinter has no BARCODE_WIDTH command (as of v7.5)
        // } else if (width >= 1 && width <= 5) {
        //   this.buffer.write(_.BARCODE_FORMAT.BARCODE_WIDTH[width]);
        // } else {
        //   this.buffer.write(_.BARCODE_FORMAT.BARCODE_WIDTH_DEFAULT);
        // }
        // if (height >= 1 && height <= 255) {
        //   this.buffer.write(_.BARCODE_FORMAT.BARCODE_HEIGHT(height));
        // } else {
        //   if (this._model === 'qsprinter') {
        //     this.buffer.write(_.MODEL.QSPRINTER.BARCODE_HEIGHT_DEFAULT);
        //   } else {
        //     this.buffer.write(_.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT);
        //   }
        // }
        // if (this._model === 'qsprinter') {
        //   // Qsprinter has no barcode font
        // } else {
        //   this.buffer.write(_.BARCODE_FORMAT[
        //   'BARCODE_FONT_' + (font || 'A').toUpperCase()
        //     ]);
        // }
        // this.buffer.write(_.BARCODE_FORMAT[
        // 'BARCODE_TXT_' + (position || 'BLW').toUpperCase()
        //   ]);
        // this.buffer.write(_.BARCODE_FORMAT[
        // 'BARCODE_' + ((type || 'EAN13').replace('-', '_').toUpperCase())
        //   ]);
        // if (includeParity) {
        //   if (type === 'EAN13' || type === 'EAN8') {
        //     parityBit = utils.getParityBit(code);
        //   }
        // }
        // if (type == 'CODE128' || type == 'CODE93') {
        //   codeLength = utils.codeLength(code);
        // }
        // this.buffer.write(codeLength + code + (includeParity ? parityBit : '') + '\x00'); // Allow to skip the parity byte
        // if (this._model === 'qsprinter') {
        //   this.buffer.write(_.MODEL.QSPRINTER.BARCODE_MODE.OFF);
        // }
        return this;
    };
    PDFPrinter.prototype.qrcode = function (code) {
        // TODO: Implement printing QR Code to PDF
        console.log("Function qrcode not yet implemented on PDFPrinter");
        // if (this._model !== 'qsprinter') {
        //   this.buffer.write(_.CODE2D_FORMAT.TYPE_QR);
        //   this.buffer.write(_.CODE2D_FORMAT.CODE2D);
        //   this.buffer.writeUInt8(version || 3);
        //   this.buffer.write(_.CODE2D_FORMAT[
        //   'QR_LEVEL_' + (level || 'L').toUpperCase()
        //     ]);
        //   this.buffer.writeUInt8(size || 6);
        //   this.buffer.writeUInt16LE(code.length);
        //   this.buffer.write(code);
        // } else {
        //   const dataRaw = iconv.encode(code, 'utf8');
        //   if (dataRaw.length < 1 && dataRaw.length > 2710) {
        //     throw new Error('Invalid code length in byte. Must be between 1 and 2710');
        //   }
        //
        //   // Set pixel size
        //   if (!size || (size && typeof size !== 'number'))
        //     size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.DEFAULT;
        //   else if (size && size < _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MIN)
        //     size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MIN;
        //   else if (size && size > _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MAX)
        //     size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MAX;
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.CMD);
        //   this.buffer.writeUInt8(size);
        //
        //   // Set version
        //   if (!version || (version && typeof version !== 'number'))
        //     version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.DEFAULT;
        //   else if (version && version < _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MIN)
        //     version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MIN;
        //   else if (version && version > _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MAX)
        //     version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MAX;
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.CMD);
        //   this.buffer.writeUInt8(version);
        //
        //   // Set level
        //   if (!level || (level && typeof level !== 'string'))
        //     level = _.CODE2D_FORMAT.QR_LEVEL_L;
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.LEVEL.CMD);
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.LEVEL.OPTIONS[level.toUpperCase()]);
        //
        //   // Transfer data(code) to buffer
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.SAVEBUF.CMD_P1);
        //   this.buffer.writeUInt16LE(dataRaw.length + _.MODEL.QSPRINTER.CODE2D_FORMAT.LEN_OFFSET);
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.SAVEBUF.CMD_P2);
        //   this.buffer.write(dataRaw);
        //
        //   // Print from buffer
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PRINTBUF.CMD_P1);
        //   this.buffer.writeUInt16LE(dataRaw.length + _.MODEL.QSPRINTER.CODE2D_FORMAT.LEN_OFFSET);
        //   this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PRINTBUF.CMD_P2);
        // }
        return this;
    };
    PDFPrinter.prototype.qrimage = function (content) {
        // TODO: Implement printing QR Code to PDF
        console.log("Function qrimage not yet implemented on PDFPrinter");
        // var self = this;
        // if (typeof options == 'function') {
        //   callback = options;
        //   options = null;
        // }
        // options = options || { type: 'png', mode: 'dhdw' };
        // var buffer = qr.imageSync(content, options);
        // var type = ['image', options.type].join('/');
        // getPixels(buffer, type, function (err, pixels) {
        //   if (err) return callback && callback(err);
        //   self.raster(new Image(pixels), options.mode);
        //   callback && callback.call(self, null, self);
        // });
        return this;
    };
    PDFPrinter.prototype.image = function (image, density) {
        // TODO: Implement printing image to pdf
        console.log("Function image not yet implemented on PDFPrinter");
        // if (!(image instanceof Image))
        //   throw new TypeError('Only escpos.Image supported');
        // density = density || 'd24';
        // var n = !!~['d8', 's8'].indexOf(density) ? 1 : 3;
        // var header = _.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
        // var bitmap = image.toBitmap(n * 8);
        // var self = this;
        //
        // // added a delay so the printer can process the graphical data
        // // when connected via slower connection ( e.g.: Serial)
        // this.lineSpace(0); // set line spacing to 0
        // bitmap.data.forEach(async (line) => {
        //   self.buffer.write(header);
        //   self.buffer.writeUInt16LE(line.length / n);
        //   self.buffer.write(line);
        //   self.buffer.write(_.EOL);
        //   await new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //       resolve(true)
        //     }, 200);
        //   });
        // });
        // return this.lineSpace();
        return this;
    };
    PDFPrinter.prototype.raster = function (image, mode) {
        // TODO: Implement printing raster image to pdf
        console.log("Function raster not yet implemented on PDFPrinter.");
        // if (!(image instanceof Image))
        //   throw new TypeError('Only escpos.Image supported');
        // mode = mode || 'normal';
        // if (mode === 'dhdw' ||
        //   mode === 'dwh' ||
        //   mode === 'dhw') mode = 'dwdh';
        // var raster = image.toRaster();
        // var header = _.GSV0_FORMAT['GSV0_' + mode.toUpperCase()];
        // this.buffer.write(header);
        // this.buffer.writeUInt16LE(raster.width);
        // this.buffer.writeUInt16LE(raster.height);
        // this.buffer.write(raster.data);
        return this;
    };
    return PDFPrinter;
}());
exports.default = PDFPrinter;
//# sourceMappingURL=index.js.map