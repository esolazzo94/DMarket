export class Escrow {
    productHash: string;
    buyer: string;
    seller: string;
    state: string;
}

export enum State {Contratto_creato,In_attesa_del_venditore,Prodotto_disponibile,In_attesa_del_compratore,Operazione_conclusa}