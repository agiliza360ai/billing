import { PaymentOption } from "./options.interface";

const paymentOptions: PaymentOption = {
  tipo_pago: ["transferencia", "billetera_digital", "pago_link"],
  providers: [
    {
      type: "transferencia",
      options: [
        {
          name: "BCP",
          code: "bcp",
        },
        {
          name: "BBVA",
          code: "bbva",
        },
        {
          name: "Interbank",
          code: "interbank",
        },
        {
          name: "Scotiabank",
          code: "scotiabank"
        },
        {
          name: "BanBif",
          code: "banbif",
        },
      ]
    },
    {
      type: "billetera_digital",
      options: [
        {
          name: "Yape",
          code: "yape",
        },
        {
          name: "Plin",
          code: "plin",
        },
        {
          name: "Mercado Pago",
          code: "mercadopago",
        }
      ]
    },
  ]
}

export default paymentOptions;
