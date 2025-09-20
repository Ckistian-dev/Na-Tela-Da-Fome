/**
 * Busca os dados de um restaurante fazendo uma chamada para nossa própria API de backend.
 * @param {string} companySlug - O identificador da empresa na URL.
 * @returns {Promise<object>} - Uma promessa que resolve com todos os dados do restaurante.
 */
export const fetchRestaurantData = async (companySlug) => {
  try {
    // A chamada agora é para o nosso endpoint, não mais diretamente para o Google.
    const response = await fetch(`/api/sheetData?slug=${companySlug}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Erro ao buscar dados do nosso backend:", error);
    // Propaga o erro para o componente App poder tratar.
    throw error;
  }
};

