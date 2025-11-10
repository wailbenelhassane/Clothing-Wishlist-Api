class ClothingItem {
  constructor({ id, name, brand, size, color, price, wishlist, notes, link, reference }) {
    this.id = id;
    this.name = name;           // Ej: "Chaqueta de cuero"
    this.brand = brand;         // Ej: "Zara"
    this.size = size;           // Ej: "M", "L", "XL"
    this.color = color;         // Ej: "Negro"
    this.price = Number(price); // Ej: 79.99
    this.wishlist = !!wishlist; // Booleano
    this.notes = notes || "";   // Texto opcional
    this.link = link || "";     // URL opcional (enlace al producto)
    this.reference = reference || ""; // Código o referencia del producto
  }
}

module.exports = ClothingItem;

