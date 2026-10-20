import { useCallback, useEffect, useMemo, useState } from "react";
import { createBook, getDatabaseRows, PAGE_SIZE } from "../api/database";

const entities = {
  livros: {
    label: "Livros",
    singular: "livro",
    description: "Catálogo de livros",
    filters: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "autor", label: "Autor", type: "text" },
      { key: "ano_de_publicacao", label: "Ano de publicação", type: "number" },
      { key: "pais", label: "País", type: "text" },
      { key: "linguagem", label: "Idioma", type: "text" },
      { key: "genero", label: "Gênero", type: "text" },
    ],
    canCreate: true,
    columns: [
      { key: "id_livro", label: "ID", width: "id" },
      { key: "titulo", label: "Título" },
      { key: "autor", label: "Autor" },
      { key: "ano_de_publicacao", label: "Ano" },
      { key: "pais", label: "País" },
      { key: "linguagem", label: "Idioma" },
      { key: "genero", label: "Gênero" },
      { key: "restricao_de_idade", label: "Idade" },
    ],
    fields: [
      { key: "titulo", label: "Título" },
      { key: "autor", label: "Autor", required: true },
      { key: "ano_de_publicacao", label: "Ano de publicação", type: "number", min: 0 },
      { key: "pais", label: "País" },
      { key: "linguagem", label: "Idioma" },
      { key: "sinopse", label: "Sinopse", type: "textarea" },
      { key: "capa", label: "URL da capa", type: "url" },
      { key: "genero", label: "Gênero" },
      { key: "restricao_de_idade", label: "Classificação etária", type: "number", min: 0 },
    ],
  },
  assinatura: {
    label: "Assinaturas",
    singular: "assinatura",
    description: "Contas e planos associados",
    filters: [
      { key: "email", label: "E-mail", type: "text" },
      { key: "id_tipo_assinatura", label: "ID do tipo de assinatura", type: "number" },
    ],
    columns: [
      { key: "id_assinatura", label: "ID", width: "id" },
      { key: "email", label: "E-mail" },
      { key: "id_tipo_assinatura", label: "ID do tipo", width: "id" },
    ],
    fields: [
      { key: "email", label: "E-mail", type: "email", required: true },
      { key: "id_tipo_assinatura", label: "ID do tipo de assinatura", type: "number", min: 1, required: true },
    ],
  },
  tipo_assinatura: {
    label: "Tipos de assinatura",
    singular: "tipo de assinatura",
    description: "Planos disponíveis",
    filters: [
      { key: "nome", label: "Nome", type: "text" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "maximo_acessos", label: "Máximo de acessos", type: "number" },
    ],
    columns: [
      { key: "id_tipo_assinatura", label: "ID", width: "id" },
      { key: "nome", label: "Nome do plano" },
      { key: "valor", label: "Valor", format: "currency" },
      { key: "maximo_acessos", label: "Acessos", width: "id" },
    ],
    fields: [
      { key: "nome", label: "Nome do plano", required: true },
      { key: "valor", label: "Valor (R$)", type: "number", min: 0, step: "0.01", required: true },
      { key: "maximo_acessos", label: "Máximo de acessos", type: "number", min: 1, required: true },
    ],
  },
};

function formatValue(value, format) {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "currency") {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return value;
}

function getUserName(user) {
  const name = user?.nome ?? user?.name;
  return typeof name === "string" && name.trim() ? name.trim().split(" ")[0] : "por aqui";
}

export default function DatabasePage({ user, onLogout }) {
  const [selectedEntity, setSelectedEntity] = useState("livros");
  const [rowsByEntity, setRowsByEntity] = useState({ livros: [], assinatura: [], tipo_assinatura: [] });
  const [filterField, setFilterField] = useState(entities.livros.filters[0].key);
  const [operator, setOperator] = useState("contains");
  const [filterValue, setFilterValue] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const entity = entities[selectedEntity];
  const rows = rowsByEntity[selectedEntity];
  const currentFilter = entity.filters.find((field) => field.key === filterField) ?? entity.filters[0];
  const loadRows = useCallback(async ({ entityKey = selectedEntity, filter = activeFilter, offset = 0, append = false, signal } = {}) => {
    try {
      const result = await getDatabaseRows(entityKey, { filter, offset, signal });
      setRowsByEntity((current) => ({
        ...current,
        [entityKey]: append ? [...current[entityKey], ...result] : result,
      }));
      setHasMore(result.length === PAGE_SIZE);
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message || "Não foi possível carregar os registros.");
        if (!append) setRowsByEntity((current) => ({ ...current, [entityKey]: [] }));
        setHasMore(false);
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [activeFilter, selectedEntity]);

  useEffect(() => {
    const controller = new AbortController();
    getDatabaseRows(selectedEntity, { filter: activeFilter, offset: 0, signal: controller.signal })
      .then((result) => {
        setRowsByEntity((current) => ({ ...current, [selectedEntity]: result }));
        setHasMore(result.length === PAGE_SIZE);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Não foi possível carregar os registros.");
          setRowsByEntity((current) => ({ ...current, [selectedEntity]: [] }));
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [activeFilter, selectedEntity]);

  const filteredRows = useMemo(() => {
    if (selectedEntity !== "tipo_assinatura" || !activeFilter?.value) return rows;

    return rows.filter((row) => {
      const cell = row[activeFilter.field];
      if (cell === null || cell === undefined) return false;

      const filterValue = activeFilter.value.toLocaleLowerCase("pt-BR");
      return activeFilter.operator === "contains"
        ? String(cell).toLocaleLowerCase("pt-BR").includes(filterValue)
        : String(cell).toLocaleLowerCase("pt-BR") === filterValue;
    });
  }, [activeFilter, rows, selectedEntity]);

  function handleEntityChange(event) {
    const nextEntity = event.target.value;
    setIsLoading(true);
    setSelectedEntity(nextEntity);
    setFilterField(entities[nextEntity].filters[0].key);
    setOperator("contains");
    setFilterValue("");
    setActiveFilter(null);
    setNewRecord({});
    setNotice("");
    setError("");
  }

  function handleSearch(event) {
    event.preventDefault();
    const nextFilter = filterValue.trim() ? { field: filterField, operator, value: filterValue.trim() } : null;
    if (nextFilter || activeFilter) setIsLoading(true);
    setActiveFilter(nextFilter);
    setNotice("");
    setError("");
  }

  function clearSearch() {
    setFilterValue("");
    if (activeFilter) setIsLoading(true);
    setActiveFilter(null);
    setNotice("");
    setError("");
  }

  function handleLoadMore() {
    setIsLoading(true);
    setError("");
    loadRows({ offset: rows.length, append: true });
  }

  function openForm() {
    setNewRecord({});
    setError("");
    setNotice("");
    setIsFormOpen(true);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const wasFiltered = Boolean(activeFilter);

    const record = {};
    for (const field of entity.fields) {
      const value = newRecord[field.key];
      if (value !== undefined && value !== "") {
        record[field.key] = field.type === "number" ? Number(value) : value.trim();
      }
    }

    try {
      await createBook(record);
      setIsFormOpen(false);
      setNewRecord({});
      setFilterValue("");
      setActiveFilter(null);
      setNotice("Livro salvo no banco de dados.");
      setIsLoading(true);
      setError("");
      if (!wasFiltered) {
        await loadRows({ entityKey: "livros", filter: null, offset: 0 });
      }
    } catch (createError) {
      setError(createError.message || "Não foi possível salvar o livro.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="database-page">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Página inicial do catálogo">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>livraria<span className="brand-accent">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="environment-badge"><span aria-hidden="true" />Banco de dados</span>
          <span className="user-greeting">Olá, {getUserName(user)}</span>
          <button className="logout-button" type="button" onClick={onLogout}>Sair</button>
        </div>
      </header>

      <div className="database-content" id="inicio">
        <section className="page-intro">
          <p className="eyebrow">ESPAÇO DE TRABALHO <span>/</span> BANCO DE DADOS</p>
          <div className="intro-row">
            <div>
              <h1>Explore seus dados<span>.</span></h1>
              <p>Consulte e organize os registros do seu catálogo em um só lugar.</p>
            </div>
            {entity.canCreate && (
              <button className="add-button" type="button" onClick={openForm}>
                <span aria-hidden="true">+</span> Adicionar registro
              </button>
            )}
          </div>
        </section>

        <aside className="demo-notice" role="status">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p><strong>Dados do backend</strong> — consultas são feitas nas rotas disponíveis. A criação de registros está habilitada para livros.</p>
        </aside>

        <section className="workspace-card" aria-labelledby="records-heading">
          <div className="workspace-heading">
            <div>
              <p className="section-kicker">DADOS</p>
              <h2 id="records-heading">Registros</h2>
            </div>
            <label className="entity-picker">
              <span>Tabela</span>
              <select value={selectedEntity} onChange={handleEntityChange} aria-label="Selecionar tabela">
                {Object.entries(entities).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="table-description">
            <span className="table-indicator" aria-hidden="true" />
            <span>{entity.description}</span>
            <span className="record-count">{filteredRows.length} {filteredRows.length === 1 ? "registro" : "registros"}</span>
          </div>

          <form className="filter-form" onSubmit={handleSearch}>
            <div className="filter-title">
              <span className="filter-icon" aria-hidden="true">⌕</span>
              <span>Filtrar registros</span>
            </div>
            <div className="filter-controls">
              <label>
                <span>Campo</span>
                <select value={filterField} onChange={(event) => {
                  const nextField = entity.filters.find((field) => field.key === event.target.value);
                  setFilterField(event.target.value);
                  setOperator(nextField?.type === "number" ? "equals" : "contains");
                }}>
                  {entity.filters.map((field) => (
                    <option key={field.key} value={field.key}>{field.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Condição</span>
                <select value={operator} onChange={(event) => setOperator(event.target.value)}>
                  {currentFilter.type === "number"
                    ? <option value="equals">Igual a</option>
                    : <option value="contains">Contém</option>}
                </select>
              </label>
              <label className="filter-value">
                <span>Valor</span>
                <input
                  type={currentFilter.type === "number" ? "number" : "search"}
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  placeholder={currentFilter.type === "number" ? "Digite um número" : `Buscar por ${currentFilter.label.toLocaleLowerCase("pt-BR")}`}
                  aria-label="Valor do filtro"
                />
              </label>
              <div className="filter-actions">
                <button type="submit" className="search-button">Buscar</button>
                <button type="button" className="clear-button" onClick={clearSearch}>Limpar</button>
              </div>
            </div>
          </form>

          {notice && <p className="feedback-message" role="status">{notice}</p>}
          {error && <p className="feedback-error" role="alert">{error}</p>}

          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>{entity.columns.map((column) => <th className={column.width === "id" ? "id-column" : ""} key={column.key}>{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row[entity.columns.find((column) => column.key.startsWith("id_"))?.key]}>
                    {entity.columns.map((column) => (
                      <td className={column.width === "id" ? "id-column id-value" : ""} key={column.key}>
                        {formatValue(row[column.key], column.format)}
                      </td>
                    ))}
                  </tr>
                ))}
                {!isLoading && filteredRows.length === 0 && (
                  <tr>
                    <td className="empty-state" colSpan={entity.columns.length}>
                      <span className="empty-icon" aria-hidden="true">⌕</span>
                      <strong>{error ? "Não foi possível carregar os registros" : "Nenhum registro encontrado"}</strong>
                      {!error && <span>Tente mudar os filtros ou limpar a busca.</span>}
                    </td>
                  </tr>
                )}
                {isLoading && filteredRows.length === 0 && (
                  <tr>
                    <td className="empty-state" colSpan={entity.columns.length}>
                      <strong>Carregando registros...</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>{filteredRows.length} registros carregados do backend</span>
            <span>{isLoading ? "Atualizando..." : "Dados atualizados"}</span>
          </footer>
          {hasMore && (
            <div className="filter-actions">
              <button
                type="button"
                className="clear-button"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </section>
        <p className="page-footer">Os registros exibidos são consultados no backend.</p>
      </div>

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsFormOpen(false);
        }}>
          <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div>
                <p className="section-kicker">NOVO REGISTRO</p>
                <h2 id="modal-title">Adicionar {entity.singular}</h2>
                <p>Preencha os dados para salvar o livro no banco.</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setIsFormOpen(false)} aria-label="Fechar">×</button>
            </div>
            <form className="record-form" onSubmit={handleCreate}>
              {entity.fields.map((field) => (
                <label className={field.type === "textarea" ? "form-field full-width" : "form-field"} key={field.key}>
                  <span>{field.label}{field.required && <span className="required-mark"> *</span>}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      rows="3"
                      value={newRecord[field.key] ?? ""}
                      onChange={(event) => setNewRecord((current) => ({ ...current, [field.key]: event.target.value }))}
                    />
                  ) : (
                    <input
                      name={field.key}
                      type={field.type ?? "text"}
                      min={field.min}
                      step={field.step}
                      value={newRecord[field.key] ?? ""}
                      onChange={(event) => setNewRecord((current) => ({ ...current, [field.key]: event.target.value }))}
                      required={field.required}
                    />
                  )}
                </label>
              ))}
              {error && <p className="feedback-error" role="alert">{error}</p>}
              <p className="form-note">O identificador será gerado pelo banco de dados.</p>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                <button type="submit" className="search-button" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Adicionar registro"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
