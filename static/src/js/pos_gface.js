odoo.define('pos_gface.pos_gface', function (require) {
"use strict";

var models = require('point_of_sale.models');
var screens = require('point_of_sale.screens');
var Model = require('web.DataModel');

screens.ReceiptScreenWidget.include({
    print_web: function(){
        var order = this.pos.get_order();

        var widget = this;
        var receipt = order.export_for_printing();
        var orderlines = order.get_orderlines();
        var paymentlines = order.get_paymentlines();

        var serie = widget.pos.sale_journal.serie_gface;
        var resolucion = widget.pos.sale_journal.numero_resolucion_gface;
        var del = widget.pos.sale_journal.rango_inicial_gface;
        var al = widget.pos.sale_journal.rango_final_gface;
        var fecha = widget.pos.sale_journal.fecha_resolucion_gface;
        var direccion = widget.pos.sale_journal_address.street;

        var ticket = order.name+"$intro$";
        ticket += widget.pos.config.name+"$intro$";
        ticket += widget.pos.company.name+"$intro$";
        if (receipt.header) {
            ticket += receipt.header+"$intro$";
        }
        ticket += direccion+"$intro$";
        ticket += "NIT: "+widget.pos.company.vat+"$intro$";
        ticket += "Serie: "+serie+"$intro$";
        ticket += "Resolución: "+resolucion+"$intro$";
        ticket += "Del: "+del+" al: "+al+"$intro$";
        ticket += "Fecha Resolución: "+moment(fecha).format('L')+"$intro$";
        var serie_gface = "FACE63" + widget.pos.sale_journal.serie_gface + widget.pos.sale_journal.dispositivo_gface;
        ticket += "Factura Electronica:$intro$";
        ticket += "Serie: "+serie_gface+"$intro$";
        if (order.numero_gface) {
            ticket += "Documento: "+order.numero_gface.replace(serie_gface, '')+"$intro$$intro$";
        }
        ticket += "Fecha: "+moment(order.creation_date).format('L LT')+"$intro$";
        ticket += "Usuario: "+(widget.pos.cashier ? widget.pos.cashier.name : widget.pos.user.name)+"$intro$";
        if (order.tag_number) {
            ticket += "Etiqueta: "+order.tag_number+"$intro$";
        }
        if (order.take_out) {
            ticket += "Para llevar$intro$";
        }
        if (order.get_client().vat && (order.get_client().vat == 'CF' || order.get_client().vat == 'C/F')) {
            ticket += "NIT: _________________________$intro$";
            ticket += "Nombre: ______________________$intro$";
        } else {
            ticket += "NIT: "+(order.get_client().vat ? order.get_client().vat : '')+"$intro$";
            ticket += "Nombre: "+order.get_client().name+"$intro$";
        }
        ticket += "Cant	Producto	Precio$intro$";
        orderlines.forEach(function(orderline) {
            ticket += orderline.get_quantity_str_with_unit()+"	"+orderline.get_product().display_name+"	"+widget.format_currency(orderline.get_display_price())+"$intro$";
        })
        ticket += "Total: "+widget.format_currency(order.get_total_with_tax())+"$intro$";
        paymentlines.forEach(function(line) {
            ticket += line.name+": "+widget.format_currency(line.get_amount())+"$intro$";
        })
        ticket += "Cambio: "+widget.format_currency(order.get_change())+"$intro$";

        ticket += "Datos del GFACE$intro$";
        ticket += "Infile, S.A.$intro$";
        ticket += "NIT: 1252133-7$intro$";
        if (order.firma_gface) {
            ticket += "CAE: "+order.firma_gface.slice(0, 32)+"$intro$";
            ticket += order.firma_gface.slice(32)+"$intro$";
        }
        ticket += "Sujeto a pagos trimestrales$intro$";
        if (receipt.footer) {
            ticket += receipt.footer+"$intro$";
        }
        ticket += "$intro$$intro$$intro$$intro$$intro$$intro$$cut$$intro$$intro$$intro$";

        var comanda = order.name+"$intro$";
        comanda += widget.pos.config.name+"$intro$";
        if (order.tag_number) {
            comanda += "Etiqueta: "+order.tag_number+"$intro$";
        }
        if (order.take_out) {
            comanda += "Para llevar$intro$";
        }
        comanda += "Fecha: "+moment(order.creation_date).format('L LT')+"$intro$";
        comanda += "Usuario: "+(widget.pos.cashier ? widget.pos.cashier.name : widget.pos.user.name)+"$intro$";
        comanda += "Cant	Producto$intro$";
        orderlines.forEach(function(orderline) {
            comanda += orderline.get_quantity_str_with_unit()+"	"+orderline.get_product().display_name+"$intro$";
        })
        comanda += "$intro$$intro$$intro$$intro$$intro$$intro$$cut$$intro$$intro$$intro$";

        var ticketEncoded = encodeURI(ticket);
        var comandaEncoded = encodeURI(comanda);
        window.location.href="com.fidelier.printfromweb://"+ticketEncoded+comandaEncoded+comandaEncoded;
    }
})

models.PosModel = models.PosModel.include({
    push_and_invoice_order: function(order){
        var self = this;
        var invoiced = new $.Deferred();

        if(!order.get_client()){
            invoiced.reject({code:400, message:'Missing Customer', data:{}});
            return invoiced;
        }

        var order_id = this.db.add_order(order.export_as_JSON());

        this.flush_mutex.exec(function(){
            var done = new $.Deferred(); // holds the mutex

            var transfer = self._flush_orders([self.db.get_order(order_id)], {timeout:60000, to_invoice:true});

            transfer.fail(function(error){
                invoiced.reject(error);
                done.reject();
            });

            // on success, get the order id generated by the server
            transfer.pipe(function(order_server_id){
                var m = new Model("pos.order");

                if (order_server_id.length > 0) {
                    m.query(["firma_gface", "numero_gface"])
                        .filter([['id', '=', order_server_id[0]]])
                        .all().then(function (orders) {
                            if (orders.length > 0) {
                                self.get_order().firma_gface = orders[0].firma_gface
                                self.get_order().numero_gface = orders[0].numero_gface
                                invoiced.resolve();
                                done.resolve();
                            }
                        });
                } else {
                    m.query(["firma_gface", "numero_gface"])
                        .filter([['pos_reference', '=', order.name]])
                        .all().then(function (orders) {
                            if (orders.length > 0) {
                                self.get_order().firma_gface = orders[0].firma_gface
                                self.get_order().numero_gface = orders[0].numero_gface
                                invoiced.resolve();
                                done.resolve();
                            }
                        });
                }
            });

            return done;

        });

        return invoiced;
    }
})

});
