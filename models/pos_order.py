# -*- encoding: utf-8 -*-

from odoo import models, fields, api, _

class PosOrder(models.Model):
    _inherit = 'pos.order'

    pdf_gface = fields.Binary('PDF GFACE', related='invoice_id.pdf_gface')
    firma_gface = fields.Char('Firma GFACE', related='invoice_id.firma_gface')
    numero_gface = fields.Char('Numero GFACE', related='invoice_id.name')
