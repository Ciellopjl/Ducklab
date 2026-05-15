/**
 * Verifica se a loja está aberta.
 * Dias de funcionamento: sábado, domingo e segunda-feira.
 * Horário: 18h às 00h (Brasília).
 * Fora dos dias ou horário permitidos retorna false.
 */
export function isStoreOpen(
  horarioAbertura: string = '18:00', 
  horarioFechamento: string = '00:00',
  diasAbertos: string = "0,1,2,3,4,5,6"
): boolean {
  const agora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const diaAtualIndex = agora.getDay();
  
  // 1. VERIFICAÇÃO DE DIA (CALENDÁRIO)
  // Prioridade absoluta: Se o dia não estiver marcado no painel, FECHADO.
  const diasPermitidos = (diasAbertos || "0,1,2,3,4,5,6").split(',').filter(d => d.trim() !== '').map(Number);
  if (!diasPermitidos.includes(diaAtualIndex)) {
    return false;
  }

  // 2. VERIFICAÇÃO DE HORÁRIO
  const horaAtual = agora.getHours();
  const minAtual = agora.getMinutes();
  const timeInMinutes = horaAtual * 60 + minAtual;

  const [startH, startM] = horarioAbertura.split(':').map(Number);
  const [endH, endM] = horarioFechamento.split(':').map(Number);
  
  const startInMinutes = startH * 60 + (startM || 0);
  let endInMinutes = endH * 60 + (endM || 0);
  
  // Se o fechamento for 00:00 ou antes da abertura (ex: abre 18h fecha 02h)
  if (endInMinutes <= startInMinutes) {
    endInMinutes += 24 * 60;
  }

  // Se agora for "madrugada" e a loja abriu ontem
  if (timeInMinutes < startInMinutes && timeInMinutes <= (endInMinutes - 24 * 60)) {
     return true;
  }

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
}

