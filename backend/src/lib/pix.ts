function crc16ccitt(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

const pad = (id: string, value: string) => {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
};

export function gerarPayloadPix(valor: number): string {
  const chavePix = 'marcoseduardo52941@gmail.com';
  const nome = 'MARCOS E F DOS SANTOS';
  const cidade = 'BATALHA';
  const txid = '***'; // TXID padrão do Inter ou dinâmico

  const p00 = pad('00', '01');
  const p26_00 = pad('00', 'BR.GOV.BCB.PIX');
  const p26_01 = pad('01', chavePix);
  const p26_02 = pad('02', 'MARCOS E F DOS SANTOS');
  const p26 = pad('26', p26_00 + p26_01 + p26_02);
  const p52 = pad('52', '0000');
  const p53 = pad('53', '986');
  const p54 = valor > 0 ? pad('54', valor.toFixed(2)) : '';
  const p58 = pad('58', 'BR');
  const p59 = pad('59', nome);
  const p60 = pad('60', cidade);
  const p62 = pad('62', pad('05', txid));
  
  const payloadToCRC = p00 + p26 + p52 + p53 + p54 + p58 + p59 + p60 + p62 + '6304';
  return payloadToCRC + crc16ccitt(payloadToCRC);
}
