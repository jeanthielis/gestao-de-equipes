// src/lib/relatoriosPDF.js
// Biblioteca centralizada de geração de PDFs do SafeTrack
import html2pdf from 'html2pdf.js'

// ── Utilitários ──────────────────────────────────────────────
const dataHoje = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dataHoraAgora = () => new Date().toLocaleString('pt-BR')

const corConformidade = (pct) => {
  if (pct >= 90) return '#10b981'
  if (pct >= 60) return '#f59e0b'
  return '#f43f5e'
}

const badgeStatus = (s) => {
  const mapa = {
    C:  { bg: '#d1fae5', color: '#065f46', label: 'Conforme' },
    CP: { bg: '#fef3c7', color: '#92400e', label: 'Conf. Parcial' },
    NC: { bg: '#fee2e2', color: '#991b1b', label: 'Não Conforme' },
  }
  const b = mapa[s] || { bg: '#f1f5f9', color: '#475569', label: s }
  return `<span style="background:${b.bg};color:${b.color};padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700">${b.label}</span>`
}

const cabecalhoPDF = (titulo, subtitulo = '') => `
  <div style="border-bottom:3px solid #0f172a;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end">
    <div>
      <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin:0;letter-spacing:-0.5px">SafeTrack</h1>
      <h2 style="font-size:15px;font-weight:700;color:#475569;margin:4px 0 0">${titulo}</h2>
      ${subtitulo ? `<p style="font-size:12px;color:#94a3b8;margin:2px 0 0">${subtitulo}</p>` : ''}
    </div>
    <div style="text-align:right;font-size:12px;color:#64748b;font-weight:600">
      <p style="margin:0">Gerado em: ${dataHoraAgora()}</p>
    </div>
  </div>`

const rodapePDF = () => `
  <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;font-size:10px;color:#94a3b8">
    Documento gerado eletronicamente pelo sistema SafeTrack · LGPD compliant
  </div>`

const opcoesPDF = (filename) => ({
  margin: 10,
  filename,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, windowWidth: 900 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
})

// ── 1. Relatório Avançado (Ranking + KPIs + Top NCs) ─────────
export const gerarRelatorioAvancadoPDF = async ({ filtros, kpis, ranking, topCriterios, periodo }) => {
  const linhasRanking = ranking.slice(0, 15).map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:8px 12px;font-weight:700;color:#64748b">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:700;color:#1e293b">${r.nome}</td>
      <td style="padding:8px 12px;text-align:center;font-family:monospace">${r.total}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700;color:#065f46">${r.C}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700;color:#991b1b">${r.NC}</td>
      <td style="padding:8px 12px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
            <div style="height:100%;border-radius:3px;background:${corConformidade(r.conformidade)};width:${r.conformidade}%"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${corConformidade(r.conformidade)};min-width:34px;text-align:right">${r.conformidade}%</span>
        </div>
      </td>
    </tr>`).join('')

  const linhasNCs = topCriterios.slice(0, 10).map((c, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:8px 12px;font-weight:700;color:#64748b">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:600;color:#1e293b">${c.descricao}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:900;color:#991b1b">${c.total}×</td>
    </tr>`).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#1e293b;width:860px;background:#fff;padding:32px">
      ${cabecalhoPDF('Relatório Avançado de Conformidade', `Período: ${filtros.dataInicio} a ${filtros.dataFim} · Filtro: ${periodo}`)}

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
        ${[
          { label: 'Total avaliações', valor: kpis.total, cor: '#6366f1' },
          { label: 'Conformidade',     valor: kpis.conformidade + '%', cor: corConformidade(kpis.conformidade) },
          { label: 'Conf. Parcial',    valor: kpis.totalCP, cor: '#f59e0b' },
          { label: 'Não conformes',    valor: kpis.totalNC, cor: '#f43f5e' },
        ].map(k => `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center">
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">${k.label}</p>
            <p style="font-size:28px;font-weight:900;color:${k.cor};margin:0">${k.valor}</p>
          </div>`).join('')}
      </div>

      <h3 style="font-size:14px;font-weight:700;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px">
        Ranking de Conformidade
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:28px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">#</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Equipe/Setor</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#94a3b8">Total</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#065f46">Conformes</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#991b1b">NCs</th>
            <th style="padding:8px 12px;font-size:10px;text-transform:uppercase;color:#94a3b8">Conformidade</th>
          </tr>
        </thead>
        <tbody>${linhasRanking}</tbody>
      </table>

      <h3 style="font-size:14px;font-weight:700;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px">
        Top Critérios com Mais Desvios (NC + CP)
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">#</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Critério</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#991b1b">Ocorrências</th>
          </tr>
        </thead>
        <tbody>${linhasNCs}</tbody>
      </table>

      ${rodapePDF()}
    </div>`

  const el = document.createElement('div')
  el.innerHTML = html
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  await html2pdf().set(opcoesPDF(`SafeTrack_Relatorio_Avancado_${dataHoje().replace(/\//g, '-')}.pdf`)).from(el).save()
  document.body.removeChild(el)
}

// ── 2. Ficha Individual do Funcionário ───────────────────────
export const gerarFichaFuncionarioPDF = async ({ funcionario, avaliacoes, participacoesDDS, indiceGeral, topProblemas }) => {
  const linhasAvaliacoes = avaliacoes.slice(0, 50).map((a, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:7px 10px;color:#64748b;font-size:11px;white-space:nowrap">
        ${a.diario_execucoes?.created_at ? new Date(a.diario_execucoes.created_at).toLocaleDateString('pt-BR') : '—'}
      </td>
      <td style="padding:7px 10px;color:#1e293b;font-size:11px">${a.itens_checklist?.descricao || '—'}</td>
      <td style="padding:7px 10px;text-align:center">${badgeStatus(a.status)}</td>
      <td style="padding:7px 10px;color:#64748b;font-style:italic;font-size:11px">${a.justificativa || '—'}</td>
    </tr>`).join('')

  const corIndice = corConformidade(indiceGeral)

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#1e293b;width:860px;background:#fff;padding:32px">
      ${cabecalhoPDF('Ficha Individual do Funcionário')}

      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:24px;color:#fff;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="width:52px;height:52px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;margin-bottom:12px">
            ${funcionario.nome?.charAt(0)?.toUpperCase()}
          </div>
          <h2 style="font-size:22px;font-weight:900;margin:0">${funcionario.nome}</h2>
          <p style="color:#94a3b8;margin:4px 0 0">${funcionario.funcao || 'Operador'} · MAT: ${funcionario.matricula || 'S/N'}</p>
          <span style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;background:${funcionario.ativo ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};color:${funcionario.ativo ? '#6ee7b7' : '#fca5a5'}">
            ${funcionario.ativo ? '● Ativo' : '○ Inativo'}
          </span>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,0.08);border-radius:12px;padding:20px 28px">
          <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Conformidade Geral</p>
          <p style="font-size:48px;font-weight:900;color:${corIndice};margin:0">${indiceGeral}%</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        ${[
          { label: 'DDS participados', valor: participacoesDDS.length, cor: '#6366f1' },
          { label: 'Conformes',        valor: avaliacoes.filter(a => a.status==='C').length,  cor: '#10b981' },
          { label: 'Conf. Parcial',    valor: avaliacoes.filter(a => a.status==='CP').length, cor: '#f59e0b' },
          { label: 'Não conformes',    valor: avaliacoes.filter(a => a.status==='NC').length, cor: '#f43f5e' },
        ].map(k => `
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center">
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin:0 0 4px">${k.label}</p>
            <p style="font-size:26px;font-weight:900;color:${k.cor};margin:0">${k.valor}</p>
          </div>`).join('')}
      </div>

      ${topProblemas.length ? `
        <h3 style="font-size:13px;font-weight:700;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px">
          Critérios com Mais Desvios
        </h3>
        <div style="margin-bottom:24px">
          ${topProblemas.map(p => `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <p style="font-size:12px;font-weight:600;color:#1e293b;flex:1;margin:0">${p.descricao}</p>
              <span style="font-size:12px;font-weight:900;color:#991b1b;min-width:30px;text-align:right">${p.total}×</span>
            </div>`).join('')}
        </div>` : ''}

      <h3 style="font-size:13px;font-weight:700;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px">
        Histórico de Apontamentos (últimos 50)
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Data</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Critério</th>
            <th style="padding:7px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:#94a3b8">Status</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Justificativa</th>
          </tr>
        </thead>
        <tbody>${linhasAvaliacoes}</tbody>
      </table>

      ${rodapePDF()}
    </div>`

  const el = document.createElement('div')
  el.innerHTML = html
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  const nome = funcionario.nome?.replace(/\s+/g, '_') || 'Funcionario'
  await html2pdf().set(opcoesPDF(`SafeTrack_Ficha_${nome}_${dataHoje().replace(/\//g, '-')}.pdf`)).from(el).save()
  document.body.removeChild(el)
}

// ── 3. Relatório Completo de Apontamentos ────────────────────
export const gerarRelatorioApontamentosPDF = async ({ execucoes, filtros, kpis }) => {
  const linhas = execucoes.flatMap(exec =>
    (exec.diario_avaliacoes || []).map((a, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:6px 10px;font-size:11px;color:#64748b;white-space:nowrap">
          ${new Date(exec.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td style="padding:6px 10px;font-size:11px;font-weight:600;color:#1e293b">
          ${a.funcionarios?.nome || '—'}
        </td>
        <td style="padding:6px 10px;font-size:10px;font-family:monospace;color:#64748b">
          ${a.funcionarios?.matricula || 'S/N'}
        </td>
        <td style="padding:6px 10px;font-size:11px;color:#475569">${a.itens_checklist?.descricao || '—'}</td>
        <td style="padding:6px 10px;text-align:center">${badgeStatus(a.status)}</td>
        <td style="padding:6px 10px;font-size:11px;color:#64748b;font-style:italic">${a.justificativa || '—'}</td>
      </tr>`)
  ).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#1e293b;width:900px;background:#fff;padding:32px">
      ${cabecalhoPDF('Relatório Completo de Apontamentos', `Período: ${filtros.dataInicio} a ${filtros.dataFim}`)}

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        ${[
          { label: 'Execuções',    valor: execucoes.length, cor: '#6366f1' },
          { label: 'Conformes',    valor: kpis.totalC,      cor: '#10b981' },
          { label: 'Conf. Parcial',valor: kpis.totalCP,     cor: '#f59e0b' },
          { label: 'Não conformes',valor: kpis.totalNC,     cor: '#f43f5e' },
        ].map(k => `
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center">
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin:0 0 4px">${k.label}</p>
            <p style="font-size:26px;font-weight:900;color:${k.cor};margin:0">${k.valor}</p>
          </div>`).join('')}
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Data</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Funcionário</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Matrícula</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Critério</th>
            <th style="padding:7px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:#94a3b8">Status</th>
            <th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">Justificativa</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>

      ${rodapePDF()}
    </div>`

  const el = document.createElement('div')
  el.innerHTML = html
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  await html2pdf().set({ ...opcoesPDF(`SafeTrack_Apontamentos_${dataHoje().replace(/\//g, '-')}.pdf`), jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } }).from(el).save()
  document.body.removeChild(el)
}

// ── 4. Histórico de Ações Corretivas ─────────────────────────
export const gerarAcoesCorretivasPDF = async ({ ncs }) => {
  const corStatus = { aberta: '#991b1b', andamento: '#92400e', concluida: '#065f46' }
  const bgStatus  = { aberta: '#fee2e2', andamento: '#fef3c7', concluida: '#d1fae5' }

  const linhas = ncs.map((nc, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:8px 10px;font-size:11px;font-weight:700;color:#1e293b">${nc.funcionarios?.nome || '—'}</td>
      <td style="padding:8px 10px;font-size:10px;font-family:monospace;color:#64748b">${nc.funcionarios?.matricula || 'S/N'}</td>
      <td style="padding:8px 10px;text-align:center">${badgeStatus(nc.status)}</td>
      <td style="padding:8px 10px;font-size:11px;color:#475569">${nc.itens_checklist?.descricao || '—'}</td>
      <td style="padding:8px 10px;font-size:11px;color:#64748b;font-style:italic">${nc.justificativa || '—'}</td>
      <td style="padding:8px 10px;font-size:11px;color:#475569">${nc.acao_corretiva || '—'}</td>
      <td style="padding:8px 10px;text-align:center">
        <span style="background:${bgStatus[nc.status_acao]||'#f1f5f9'};color:${corStatus[nc.status_acao]||'#64748b'};padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:capitalize">
          ${nc.status_acao || 'aberta'}
        </span>
      </td>
      <td style="padding:8px 10px;font-size:11px;color:#64748b">${nc.responsavel_acao || '—'}</td>
      <td style="padding:8px 10px;font-size:11px;color:#64748b;white-space:nowrap">
        ${nc.data_conclusao ? new Date(nc.data_conclusao).toLocaleDateString('pt-BR') : '—'}
      </td>
    </tr>`).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#1e293b;width:1000px;background:#fff;padding:32px">
      ${cabecalhoPDF('Histórico de Ações Corretivas', `Total: ${ncs.length} registros · Gerado em ${dataHoje()}`)}

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
        ${[
          { label: 'Abertas',      valor: ncs.filter(n => !n.status_acao || n.status_acao==='aberta').length,    cor: '#f43f5e' },
          { label: 'Em andamento', valor: ncs.filter(n => n.status_acao==='andamento').length,                   cor: '#f59e0b' },
          { label: 'Concluídas',   valor: ncs.filter(n => n.status_acao==='concluida').length,                   cor: '#10b981' },
        ].map(k => `
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center">
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin:0 0 4px">${k.label}</p>
            <p style="font-size:26px;font-weight:900;color:${k.cor};margin:0">${k.valor}</p>
          </div>`).join('')}
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f1f5f9">
            ${['Funcionário','Matrícula','Tipo','Critério','Ocorrência','Ação Tomada','Situação','Responsável','Conclusão']
              .map(h => `<th style="padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94a3b8">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>

      ${rodapePDF()}
    </div>`

  const el = document.createElement('div')
  el.innerHTML = html
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  await html2pdf().set({ ...opcoesPDF(`SafeTrack_AcoesCorretivas_${dataHoje().replace(/\//g, '-')}.pdf`), jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } }).from(el).save()
  document.body.removeChild(el)
}
