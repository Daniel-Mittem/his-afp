export interface Paziente {
    id: string;
    nome: string;
    cognome: string;
    braccialetto: string;
    eta: number;
    codiceColore: string;
    note: string;
    patologia: string;
    sex: string;
}


export interface PazienteDTO {
    id: number;
    braccialetto: string;
    dataOraIngresso: string;
    stato: string;
    noteTriage: string;
    nome: string;
    cognome: string;
    dataNascita: string;
    codiceFiscale: string;
    patologiaCode: string;
    patologiaDescrizione: string;
    coloreCode: string;
    coloreHex: string;
    coloreNome: string;
    modalitaArrivoCode: string;
    modalitaArrivoDescrizione: string;
    sex: string;
}