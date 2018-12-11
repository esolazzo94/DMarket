export class Escrow {
    productHash: string;
    buyer: string;
    seller: string;
    state: string;
    escrowAddress:string;
}

export enum State {Contratto_creato,In_attesa_del_venditore,Prodotto_disponibile,Errore_nella_transazione,Operazione_conclusa}