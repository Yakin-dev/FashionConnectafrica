declare module "flutterwave-node-v3" {
  interface ChargeMethods {
    card(payload: Record<string, unknown>): Promise<any>
    account(payload: Record<string, unknown>): Promise<any>
    mobileMoney(payload: Record<string, unknown>): Promise<any>
    create(payload: Record<string, unknown>): Promise<any>
    nqr(payload: Record<string, unknown>): Promise<any>
  }

  interface MiscMethods {
    verify_transaction(id: number | string): Promise<any>
  }

  interface TransactionMethods {
    verify(payload: { id: number | string }): Promise<any>
  }

  interface MobileMoneyMethods {
    rwanda(payload: Record<string, unknown>): Promise<any>
    uganda(payload: Record<string, unknown>): Promise<any>
    kenya(payload: Record<string, unknown>): Promise<any>
    ghana(payload: Record<string, unknown>): Promise<any>
    zambia(payload: Record<string, unknown>): Promise<any>
    tanzania(payload: Record<string, unknown>): Promise<any>
    ivoryCoast(payload: Record<string, unknown>): Promise<any>
  }

  class Rave {
    Bank: any
    Beneficiary: any
    Bills: any
    Charge: ChargeMethods
    Ebills: any
    Misc: MiscMethods
    MobileMoney: MobileMoneyMethods
    Otp: any
    PaymentPlan: any
    Settlement: any
    Subscription: any
    Subaccount: any
    Tokenized: any
    Transaction: TransactionMethods
    Transfer: any
    VirtualAcct: any
    VirtualCard: any
    getIntegrityHash(data: any): string

    constructor(publicKey: string, secretKey: string, productionFlag?: boolean)
  }

  export default Rave
}
