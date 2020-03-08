# -*- encoding: utf-8 -*-

from odoo import models, fields, api, _
import logging

class PosOrder(models.Model):
    _inherit = 'pos.order'

    firma_fel = fields.Char('Firma FEL', related='invoice_id.firma_fel')
    serie_fel = fields.Char('Serie FEL', related='invoice_id.serie_fel')
    numero_fel = fields.Char('Numero FEL', related='invoice_id.numero_fel')

    @api.model
    def _action_create_invoice_line(self, line=False, invoice_id=False):
        res = super(PosOrder, self)._action_create_invoice_line(line,invoice_id)
        if line.pack_lot_ids:
            lotes = [linea.lot_name for linea in line.pack_lot_ids]
            separador = ' '
            conjunto_lotes = separador.join(lotes)
            res.write({'name':  res.name +' '+str(conjunto_lotes)})
        return res
