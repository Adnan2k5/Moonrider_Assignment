package com.javatechie.crud.example.controller;

import com.javatechie.crud.example.entity.Product;
import com.javatechie.crud.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService service;

    @PostMapping("/addProduct")
    public Product addProduct(@RequestBody Product product) {
        return service.saveProduct(product);
    }

    @PostMapping("/addProducts")
    public List<Product> addProducts(@RequestBody List<Product> products) {
        return service.saveProducts(products);
    }

    @GetMapping("/products")
    public List<Product> findAllProducts() {
        return service.getProducts();
    }

    @GetMapping("/productById/{id}")
    public Product findProductById(@PathVariable int id) {
        return service.getProductById(id);
    }

    @GetMapping("/product/{name}")
    public Product findProductByName(@PathVariable String name) {
        return service.getProductByName(name);
    }

    @PutMapping("/update")
    public Product updateProduct(@RequestBody Product product) {
        return service.updateProduct(product);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteProduct(@PathVariable int id) {
        return service.deleteProduct(id);
    }


       // v1.0.0 endpoints
    @GetMapping("/api/v1/health")
    public ResponseEntity<String> healthv1(@RequestParam String param) {
        return ResponseEntity.ok().body("Health: Good");
    }

    @GetMapping("/api/v1/products")
    public ResponseEntity<?> productsv1(@RequestParam String param) {
        return ResponseEntity.ok().body(service.getProducts());
    }

     //v1.1.0 endpoints

    @GetMapping("/api/v1.1/products")
    public ResponseEntity<?> productsv11(@RequestParam String param) {
        return ResponseEntity.ok().body(service.getProducts()); 
    }


    @GetMapping("/api/v1.1/products/search")
    public ResponseEntity<?> searchProduct(@RequestParam String param) {
        return ResponseEntity.ok().body(service.getProductByName(param));
    } 


    // v2.0.0 endpoints

    @GetMapping("/api/v2/products/search")
    public ResponseEntity<?> searchProductsWithFilters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        try{
            if(keyword == null && minPrice == null && maxPrice == null) {
                return ResponseEntity.badRequest().body("At least one filter parameter is required.");
            }

            if(minPrice != null && maxPrice != null && minPrice > maxPrice) {
                return ResponseEntity.badRequest().body("Minimum price cannot be negative.");
            }

            if(minPrice != null && minPrice < 0) {
                return ResponseEntity.badRequest().body("Minimum price cannot be negative.");
            }

            List<Product> products = service.searchProductsWithFilters(keyword, minPrice, maxPrice);
            if(products.isEmpty()) {
                return ResponseEntity.ok().body("No products found with the given filters.");
            }

            return ResponseEntity.ok().body(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while processing the request: " + e.getMessage());
        
        }
        
    }

    @GetMapping("/api/v2/health")
    public ResponseEntity<String> healthv2(@RequestParam String param) {
        return ResponseEntity.ok().body("Health: Good");
    }
    
}
