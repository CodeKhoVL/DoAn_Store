export const getCollections = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export const getCollectionDetails = async (collectionId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${collectionId}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching collection details for ID ${collectionId}:`, error);
    return null;
  }
}

export const getProducts = async () => {
  try {
    console.log('Fetching products from:', `${process.env.NEXT_PUBLIC_API_URL}/products`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return [];
    }
    
    const products = await response.json();
    console.log(`Successfully fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export const getProductDetails = async (productId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product details for ID ${productId}:`, error);
    return null;
  }
}

export const getSearchedProducts = async (query: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${query}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    return [];
  }
}

export const getOrders = async (customerId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/customers/${customerId}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    return [];
  }
}

export const getRelatedProducts = async (productId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching related products for ID ${productId}:`, error);
    return [];
  }
}