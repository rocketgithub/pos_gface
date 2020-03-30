
# -*- coding: utf-8 -*-

{
    'name': 'Point of Sale unido a facturacion electrónica',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'summary': 'Point of Sale unido a facturacion electrónica',
    'description': """ Cambios al Punto de Venta para obtener PDF desde interfaz touch """,
    'author': 'Rodrigo Fernandez',
    'depends': ['point_of_sale', 'l10n_gt_extra'],
    'data': [
        'views/report.xml',
        'views/pos_order_ticket.xml',
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/pos_gface.xml',
    ],
    'installable': True,
    'website': 'http://solucionesprisma.com',
    'auto_install': False,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
