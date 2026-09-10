import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/**
 * Converte um arquivo para Data URL (Base64) como fallback se o storage estiver indisponível.
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Comprime e redimensiona uma imagem no navegador antes de enviar ao Supabase.
 * Transforma fotos pesadas de celulares (4-12MB) em arquivos leves (~100-250KB).
 */
export const compressImage = (file, maxDimension = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    // Se for GIF ou SVG, não altera
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fundo branco para imagens com transparência convertidas para JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Falha ao processar e comprimir a imagem.'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Faz o upload da imagem diretamente para o Supabase Storage (bucket 'delivery-media').
 * Retorna a URL pública do Supabase para ser salva no banco de dados.
 *
 * @param {File} file - Arquivo de imagem selecionado pelo usuário
 * @param {Object} options - Configurações { folder, maxDim, bucket }
 * @returns {Promise<{ url: string, isFallback: boolean, error: string|null }>}
 */
export const uploadMediaToSupabase = async (file, options = {}) => {
  const {
    folder = 'general',
    maxDim = 1200,
    bucket = 'delivery-media'
  } = options;

  if (!file) {
    return { url: '', isFallback: false, error: 'Nenhum arquivo fornecido' };
  }

  const supabase = getSupabaseClient();

  // Se o Supabase não estiver configurado ainda, usa Base64 como fallback
  if (!supabase || !isSupabaseConfigured()) {
    try {
      const dataUrl = await fileToDataUrl(file);
      return {
        url: dataUrl,
        isFallback: true,
        error: 'Supabase não conectado. Imagem salva localmente no navegador.'
      };
    } catch (err) {
      return { url: '', isFallback: true, error: err.message };
    }
  }

  try {
    // 1. Otimizar e comprimir no navegador
    const compressedBlob = await compressImage(file, maxDim, 0.85);

    // 2. Gerar nome de arquivo único e limpo
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 8);
    const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase() : 'image.jpg';
    const filePath = `${folder}/${timestamp}_${randomHash}_${cleanFileName}`;

    // 3. Enviar para o bucket do Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 ano de cache para alta performance
        upsert: true
      });

    if (error) {
      console.warn(`Aviso de Storage (${error.message}). Utilizando fallback seguro.`);
      // Se der erro (ex: bucket ainda não criado), gera fallback em DataURL
      const fallbackUrl = await fileToDataUrl(file);
      return {
        url: fallbackUrl,
        isFallback: true,
        error: `Supabase Storage: ${error.message}. Crie o bucket "${bucket}" no Supabase.`
      };
    }

    // 4. Obter o link público definitivo do Supabase
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl || '';

    return {
      url: publicUrl,
      isFallback: false,
      error: null
    };
  } catch (error) {
    console.error('Erro no upload de mídia:', error);
    try {
      const fallbackUrl = await fileToDataUrl(file);
      return {
        url: fallbackUrl,
        isFallback: true,
        error: error.message
      };
    } catch (e) {
      return { url: '', isFallback: true, error: error.message };
    }
  }
};
