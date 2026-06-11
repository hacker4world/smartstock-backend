// pdf-generation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { DocumentService } from './document.service';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Return } from 'src/request-return-module/entities/return.entity';
import { getUploadsDir } from '../multer/multer.config';

export type DocumentType =
  | 'fiche_expedition'
  | 'bande_commande'
  | 'bande_livraison'
  | 'bon_de_retour'
  | 'documents_zip';
export type PdfType = 'fiche_expedition' | 'bande_livraison' | 'bon_de_retour';

export interface GeneratedPdfInfo {
  type: DocumentType;
  filename: string;
  path: string;
  size: number;
}

@Injectable()
export class PdfGenerationService {
  private readonly logger = new Logger(PdfGenerationService.name);

  constructor(private readonly documentService: DocumentService) {}

  /**
   * Génère un PDF à partir de HTML brut via Puppeteer.
   */
  private async renderHtmlToPdf(html: string, filePath: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
  }

  /**
   * Génère la Fiche d'Expédition pour une demande confirmée.
   * Appelé lors de la confirmation d'une DemandeArticle.
   */
  async generateFicheExpeditionForDemande(
    demande: ProductRequest,
  ): Promise<GeneratedPdfInfo> {
    const dir = getUploadsDir('demandes', demande.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `fiche_expedition_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html =
      await this.documentService.generateFicheExpeditionHtmlForDemande(demande);

    await this.renderHtmlToPdf(html, filePath);

    const stat = fs.statSync(filePath);
    return {
      type: 'fiche_expedition',
      filename,
      path: filePath,
      size: stat.size,
    };
  }

  /**
   * Génère la Fiche d'Expédition pour une sortie interne confirmée.
   * Appelé lors de la confirmation d'une Sortie avec typeSortie = "interne_depot" ou "interne_chantier".
   */
  async generateFicheExpeditionForSortie(
    sortie: Export,
  ): Promise<GeneratedPdfInfo> {
    const dir = getUploadsDir('sorties', sortie.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `fiche_expedition_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html =
      await this.documentService.generateFicheExpeditionHtmlForSortie(sortie);

    await this.renderHtmlToPdf(html, filePath);

    const stat = fs.statSync(filePath);
    return {
      type: 'fiche_expedition',
      filename,
      path: filePath,
      size: stat.size,
    };
  }

  /**
   * Génère le Bon de Livraison (BL) pour une sortie externe confirmée.
   * Appelé lors de la confirmation d'une Sortie avec typeSortie = "externe".
   */
  async generateBonDeLivraisonForSortie(
    sortie: Export,
  ): Promise<GeneratedPdfInfo> {
    const dir = getUploadsDir('sorties', sortie.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `bande_livraison_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = await this.documentService.generateBLHtmlForSortie(sortie);

    await this.renderHtmlToPdf(html, filePath);

    const stat = fs.statSync(filePath);
    return {
      type: 'bande_livraison',
      filename,
      path: filePath,
      size: stat.size,
    };
  }

  /**
   * Génère le Bon de Retour (BR) pour un retour approuvé.
   * Appelé lors de l'approbation d'un RetourArticle.
   */
  async generateBonDeRetourForRetour(
    retour: Return,
  ): Promise<GeneratedPdfInfo> {
    const dir = getUploadsDir('retours', retour.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `bon_de_retour_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = await this.documentService.generateBonDeRetourHtml(retour);

    await this.renderHtmlToPdf(html, filePath);

    const stat = fs.statSync(filePath);
    return { type: 'bon_de_retour', filename, path: filePath, size: stat.size };
  }
}
