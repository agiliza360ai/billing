export interface PaymentProviderOptions {
  name: string;
  code: string;
}

export interface PaymentProvider {
  type: string;
  options: PaymentProviderOptions[];
}

export interface PaymentOption {
  tipo_pago: string[];
  providers: PaymentProvider[];
}