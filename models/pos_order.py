# -*- encoding: utf-8 -*-

from openerp import models, fields, api, _

class PosOrder(models.Model):
    _inherit = 'pos.order'

    pdf_gface = fields.Binary('PDF GFACE', related='invoice_id.pdf_gface')
