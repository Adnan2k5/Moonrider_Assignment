package com.javatechie.crud.example.repository;

import com.javatechie.crud.example.entity.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product,Integer> {
    Product findByName(String name);
    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> findProductsWithFilters(@Param("keyword") String keyword,
                                        @Param("minPrice") Double minPrice,
                                        @Param("maxPrice") Double maxPrice);
    
}

