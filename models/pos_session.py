# -*- encoding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

class PosSession(models.Model):
    _inherit = 'pos.session'

    def action_pos_session_close(self):
        for session in self:
            if ('iface_invoicing' in session.config_id.fields_get() and session.config_id.iface_invoicing) or ('module_account' in session.config_id.fields_get() and session.config_id.module_account):
                orders = session.order_ids.filtered(lambda order: order.state != 'invoiced' and order.amount_total > 0)
                if len(orders) > 0:
                    raise ValidationError('Tiene pedidos sin factura, no puede cerrar sesión mientras no haya facturado todos los pedidos.')
                for order in session.order_ids.filtered(lambda order: order.state == 'invoiced'):
                    if order.invoice_id.state != 'open' and not order.invoice_id.firma_fel:
                        raise ValidationError('La factura del pedido {} no está firmada, por ingrese a la factura valídela para poder cerrar sesión.'.format(order.name))

        res = super(PosSession, self).action_pos_session_close()
