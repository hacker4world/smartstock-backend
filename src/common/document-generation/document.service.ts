// delivery-document.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ProductRequest } from '../../request-return-module/entities/request.entity';
import { Export, ExportType } from 'src/import-export-module/entities/export.entity';
import { Return } from 'src/request-return-module/entities/return.entity';

interface CompanyConfig {
  name: string;
  address: string[];
  tel: string;
  web: string;
  email: string;
  rc: string;
  matriculeFiscal: string;
  logoPath?: string;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly companyConfig: CompanyConfig;

  constructor(private readonly configService: ConfigService) {
    // Load company configuration from config service or environment variables
    this.companyConfig = {
      name: this.configService.get<string>('COMPANY_NAME', 'Your Company'),
      address: this.configService
        .get<string>('COMPANY_ADDRESS', '123 Main St, City')
        .split(','),
      tel: this.configService.get<string>('COMPANY_TEL', '+216 12345678'),
      web: this.configService.get<string>('COMPANY_WEB', 'www.company.tn'),
      email: this.configService.get<string>(
        'COMPANY_EMAIL',
        'contact@company.tn',
      ),
      rc: this.configService.get<string>('COMPANY_RC', 'RC123456'),
      matriculeFiscal: this.configService.get<string>(
        'COMPANY_MATRICULE_FISCAL',
        'MF123456',
      ),
      logoPath: this.configService.get<string>('COMPANY_LOGO_PATH'),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  private toFrenchDate(iso: string): string {
    const [yy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yy}`;
  }

  private formatNumber(n: number): string {
    return Number(n).toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  }

  private generateDocNum(id: number): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = String(id).padStart(4, '0');
    return `${year}-${seq}`;
  }

  /**
   * Reads the company logo and returns a base64 data-URI string.
   */
  private getLogoDataUri(): string | null {
    const conf = this.companyConfig;
    if (!conf.logoPath) return null;

    const abs = path.isAbsolute(conf.logoPath)
      ? conf.logoPath
      : path.resolve(conf.logoPath);

    if (!fs.existsSync(abs)) {
      this.logger.warn(`Logo file not found at: ${abs}`);
      return null;
    }

    const ext = path.extname(abs).replace('.', '').toLowerCase();
    const mime =
      ext === 'png'
        ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'gif'
            ? 'image/gif'
            : 'image/png';

    const b64 = fs.readFileSync(abs).toString('base64');
    return `data:${mime};base64,${b64}`;
  }

  /* ================================================================== */
  /*  CSS for delivery / expedition documents (FE, BL, BR)               */
  /* ================================================================== */

  private deliveryCss(): string {
    return `
      @page { size: A4; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 210mm; height: 297mm; overflow: hidden; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9pt; color: #1a1a2e;
        padding: 8mm 10mm;
        display: flex; flex-direction: column;
      }

      .top-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 5mm;
        flex-shrink: 0;
      }
      .logo-area { text-align: center; }
      .logo-area img {
        width: 80px; height: 80px; object-fit: contain;
      }
      .logo-area .label {
        display: block; margin-top: 2px;
        font-size: 7pt; font-style: italic; color: #555;
      }
      .title-area { text-align: right; }
      .title-area .doc-title {
        font-size: 16pt; font-weight: bold; color: #1a1a2e;
        margin-bottom: 2mm;
      }
      .title-area .meta {
        font-size: 8pt; line-height: 1.5; color: #444;
      }

      .info-row {
        display: flex; gap: 5mm;
        margin-bottom: 4mm;
        flex-shrink: 0;
      }
      .info-box {
        flex: 1;
        border: 1px solid #2c3e6b;
        padding: 3mm;
        font-size: 8pt; line-height: 1.4;
        min-height: 28mm;
      }
      .info-box.expediteur {
        border-left: 4px solid #2c3e6b;
      }
      .info-box .box-label {
        font-size: 7pt; font-weight: bold;
        text-transform: uppercase; color: #2c3e6b;
        margin-bottom: 2mm; letter-spacing: 0.5px;
      }
      .info-box .company-name {
        font-weight: bold; font-size: 10pt; color: #1a1a2e;
        margin-bottom: 1mm;
      }

      .shipping-info {
        border: 1px solid #2c3e6b;
        padding: 2mm 4mm;
        margin-bottom: 4mm;
        font-size: 8pt; line-height: 1.5;
        flex-shrink: 0;
      }
      .shipping-info strong { color: #2c3e6b; }

      .table-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .items-table {
        width: 100%; border-collapse: collapse;
        font-size: 8pt;
        flex: 1;
      }
      .items-table thead th {
        background: #f0f0f0;
        border: 1px solid #999;
        padding: 1.5mm 2mm;
        font-weight: bold; text-align: center;
        font-size: 7.5pt; color: #1a1a2e;
      }
      .items-table thead th:first-child { text-align: left; }
      .items-table tbody td {
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        padding: 1.5mm 2mm;
        vertical-align: middle;
      }
      .items-table tbody td.center { text-align: center; }
      .items-table tbody td.right { text-align: right; }

      .items-table tbody tr.spacer-row td {
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-bottom: none;
        height: 100%;
      }

      .items-table tfoot td {
        border: 1px solid #999;
        padding: 1.5mm 2mm;
        font-weight: bold;
        background: #f0f0f0;
        text-align: center;
      }
      .items-table tfoot td:first-child { text-align: left; }

      .signature-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 3mm;
        flex-shrink: 0;
      }
      .signature-block {
        width: 55mm;
        text-align: center;
      }
      .signature-block .sig-label {
        font-weight: bold; color: #2c3e6b;
        margin-bottom: 1.5mm; font-size: 7pt;
      }
      .signature-block .sig-area {
        border: 1px solid #2c3e6b;
        height: 18mm;
        border-radius: 2px;
      }

      .footer {
        flex-shrink: 0;
        border-top: 1px solid #2c3e6b;
        margin-top: 3mm;
        padding-top: 2mm;
        font-size: 6pt; text-align: center;
        line-height: 1.5; color: #444;
        position: relative;
      }
      .footer .page-num {
        position: absolute; right: 0; bottom: 0;
        font-size: 6pt;
      }
    `;
  }

  /* ------------------------------------------------------------------ */
  /*  Shared fragments                                                   */
  /* ------------------------------------------------------------------ */

  private logoImgTag(size = 70): string {
    const dataUri = this.getLogoDataUri();
    if (dataUri) {
      return `<img src="${dataUri}" alt="Logo" style="width:${size}px;height:${size}px;object-fit:contain;" />`;
    }
    return `<div style="width:${size}px;height:${size}px;border:2px solid #2c3e6b;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16pt;color:#2c3e6b;">GRG</div>`;
  }

  private footerHtml(): string {
    const conf = this.companyConfig;
    return `
      <div class="footer">
        Siège social: ${conf.name} - ${conf.address.join(', ')}, Tunisie<br>
        Téléphone: ${conf.tel} - ${conf.web} - ${conf.email}<br>
        Société à responsabilité limitée (SARL) - RC: ${conf.rc} - Matricule fiscal: ${conf.matriculeFiscal}
        <span class="page-num">1 / 1</span>
      </div>
    `;
  }

  private signatureHtml(): string {
    return `
    <div class="signature-row">
      <div class="signature-block">
        <div class="sig-label">Cachet, Date et Signature</div>
        <div class="sig-area"></div>
      </div>
    </div>`;
  }

  /* ================================================================== */
  /*  1. Fiche d'Expédition from DemandeArticle                          */
  /* ================================================================== */

  async generateFicheExpeditionHtmlForDemande(
    demande: ProductRequest,
  ): Promise<string> {
    const conf = this.companyConfig;
    const docNum = this.generateDocNum(demande.id);
    const dateFr = this.toFrenchDate(demande.date.toString());

    /* ---- destinataire (chantier) ---- */
    const destNom = demande.constructionSite ? demande.constructionSite.name : '-';
    const destAdresse = demande.constructionSite ? demande.constructionSite.address || '' : '';

    /* ---- table rows ---- */
    let totalQty = 0;
    const itemsHtml = (demande.requestItems || [])
      .map((item) => {
        const article = item.product;
        const uniteNom = article.unit ? article.unit.name : 'pce';
        const qty = item.requestedStock;
        totalQty += qty;
        return `
        <tr>
          <td><strong>${article.name || '-'}</strong> (${uniteNom})</td>
          <td class="center">${qty}</td>
        </tr>`;
      })
      .join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${this.deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${this.logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Fiche d'Expédition N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join('<br>')}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}
    </div>
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:65%">Désignation</th>
          <th style="width:35%">Quantité</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${this.signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${this.footerHtml()}

</body></html>`;
  }

  /* ================================================================== */
  /*  2. Fiche d'Expédition from Sortie (interne)                        */
  /* ================================================================== */

  async generateFicheExpeditionHtmlForSortie(sortie: Export): Promise<string> {
    const conf = this.companyConfig;
    const docNum = this.generateDocNum(sortie.id);
    const dateFr = this.toFrenchDate(sortie.date.toString());

    /* ---- destinataire (chantier OR depot) ---- */
    let destNom = '-';
    let destAdresse = '';

    if (sortie.exportType === ExportType.TO_CONSTRUCTION_SITE && sortie.constructionSite) {
      destNom = sortie.constructionSite.name;
      destAdresse = sortie.constructionSite.address || '';
    } else if (sortie.exportType === ExportType.TO_WAREHOUSE && sortie.warehouse) {
      destNom = sortie.warehouse.name;
      destAdresse = sortie.warehouse.address || '';
    }

    /* ---- table rows ---- */
    let totalQty = 0;
    const itemsHtml = (sortie.exportItems || [])
      .map((line) => {
        const article = line.product;
        const uniteNom = article.unit ? article.unit.name : 'pce';
        const qty = Number(line.exitedStock);
        totalQty += qty;
        return `
        <tr>
          <td><strong>${article.name || '-'}</strong> (${uniteNom})</td>
          <td></td>
          <td class="center">${qty}</td>
          <td class="center">${qty}</td>
        </tr>`;
      })
      .join('');

    /* ---- shipping section ---- */
    let shippingLines = '';

    if (sortie.exportType === ExportType.TO_CONSTRUCTION_SITE) {
      shippingLines = `
        <strong>Méthode d'expédition:</strong> Nos propres moyens<br>
        <strong>Transporteur:</strong> ${sortie.transporterName || '-'}<br>
        <strong>Matricule voiture:</strong> ${sortie.transporterMatricule || '-'}`;
    } else if (sortie.exportType === ExportType.TO_WAREHOUSE) {
      shippingLines = `
        <strong>Méthode d'expédition:</strong> Nos propres moyens<br>
        <strong>Transporteur:</strong> ${sortie.transporterName || '-'}<br>
        <strong>Matricule voiture:</strong> ${sortie.transporterMatricule || '-'}`;
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${this.deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${this.logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Fiche d'Expédition N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join('<br>')}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}
    </div>
  </div>

  <!-- ===== SHIPPING INFO ===== -->
  <div class="shipping-info">
    ${shippingLines}
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%">Désignation</th>
          <th style="width:15%">Poids/vol.</th>
          <th style="width:17%">Qté commandée</th>
          <th style="width:18%">Qté. à expédier</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td></td>
          <td>${totalQty}</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${this.signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${this.footerHtml()}

</body></html>`;
  }

  /* ================================================================== */
  /*  3. Bon de Livraison (BL) from Sortie (externe)                     */
  /* ================================================================== */

  async generateBLHtmlForSortie(sortie: Export): Promise<string> {
    const conf = this.companyConfig;
    const docNum = this.generateDocNum(sortie.id);
    const dateFr = this.toFrenchDate(sortie.date.toString());

    /* ---- destinataire (enterprise info for external clients) ---- */
    const destNom = sortie.entrepriseName || '-';
    const destAdresse = sortie.address || '';
    const destMatricule = sortie.matriculeFiscale || '';

    /* ---- table rows ---- */
    let totalQty = 0;
    const itemsHtml = (sortie.exportItems || [])
      .map((line) => {
        const article = line.product;
        const uniteNom = article.unit ? article.unit.name : 'pce';
        const qty = Number(line.exitedStock);
        totalQty += qty;
        return `
        <tr>
          <td><strong>${article.name || '-'}</strong> (${uniteNom})</td>
          <td></td>
          <td class="center">${qty}</td>
          <td class="center">${qty}</td>
        </tr>`;
      })
      .join('');

    /* ---- shipping section ---- */
    let shippingLines = '';

    if (sortie.withTransporter) {
      shippingLines = `
        <strong>Méthode d'expédition:</strong> Client<br>
        <strong>Transporteur:</strong> ${sortie.transporterName || '-'}<br>
        <strong>Matricule voiture:</strong> ${sortie.transporterMatricule || '-'}`;
    } else {
        shippingLines = `
        <strong>Méthode d'expédition:</strong> Client<br>
        <strong>Nom du client:</strong> ${sortie.clientName || destNom}`;
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${this.deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${this.logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Bon De Livraison N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join('<br>')}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}${destMatricule ? `<br>Matricule fiscal: ${destMatricule}` : ''}
    </div>
  </div>

  <!-- ===== SHIPPING INFO ===== -->
  <div class="shipping-info">
    ${shippingLines}
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%">Désignation</th>
          <th style="width:15%">Poids/vol.</th>
          <th style="width:17%">Qté commandée</th>
          <th style="width:18%">Qté. à expédier</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td></td>
          <td>${totalQty}</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${this.signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${this.footerHtml()}

</body></html>`;
  }

  /* ================================================================== */
  /*  4. Bon de Retour (BR) from RetourArticle                          */
  /* ================================================================== */

  async generateBonDeRetourHtml(retour: Return): Promise<string> {
    const conf = this.companyConfig;
    const docNum = this.generateDocNum(retour.id);
    const dateFr = this.toFrenchDate(retour.date.toString());

    /* ---- client info ---- */
    const clientNom = retour.constructionSite ? retour.constructionSite.name : '-';
    const clientAdresse = retour.constructionSite ? retour.constructionSite.address || '' : '';
    const clientResp = (retour.constructionSite as any)?.compte
      ? `Responsable: ${(retour.constructionSite as any).compte.prenom} ${(retour.constructionSite as any).compte.nom}`
      : '';

    /* ---- table rows ---- */
    let totalQty = 0;
    const itemsHtml = (retour.returnItems || [])
      .map((item) => {
        const article = item.product;
        const uniteNom = article.unit ? (article.unit as any).nom : 'pce';
        const qty = item.returnedStock;
        totalQty += qty;
        return `
        <tr>
          <td><strong>${article.name || '-'}</strong> (${uniteNom})</td>
          <td class="center">${qty}</td>
          <td>${item.reason || '-'}</td>
        </tr>`;
      })
      .join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${this.deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${this.logoImgTag(85)}
    </div>
    <div class="title-area">
      <div class="doc-title" style="color:#b91c1c">Bon De Retour N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Société</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join('<br>')}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Client / Chantier</div>
      <strong>${clientNom}</strong><br>
      ${clientAdresse}<br>
      ${clientResp}
    </div>
  </div>

  <!-- ===== SHIPPING INFO ===== -->
  <div class="shipping-info">
    <strong>Méthode d'expédition:</strong> Nos propres moyens<br>
    <strong>Transporteur:</strong> ${retour.transporterName} || '-'<br>
    <strong>Matricule voiture:</strong> ${retour.transporterMatricule} || '-'
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:45%">Désignation</th>
          <th style="width:20%">Qté à retourner</th>
          <th style="width:35%">Motif de retour</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td>${totalQty}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${this.signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${this.footerHtml()}

</body></html>`;
  }
}
