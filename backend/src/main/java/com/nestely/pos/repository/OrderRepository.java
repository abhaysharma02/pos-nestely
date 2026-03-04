package com.nestely.pos.repository;

import com.nestely.pos.model.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Order> findByTenantIdAndStatus(Long tenantId, String status);
    List<Order> findByTenantIdAndCreatedAtBetween(Long tenantId, LocalDateTime start, LocalDateTime end);
    Optional<Order> findByIdAndTenantId(Long id, Long tenantId);

    // Analytics Methods
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.tenant.id = :tenantId AND o.createdAt >= :startDate AND o.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumTotalAmountByTenantIdAndCreatedAtAfter(@Param("tenantId") Long tenantId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.createdAt >= :startDate")
    Long countByTenantIdAndCreatedAtAfter(@Param("tenantId") Long tenantId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.status IN :statuses")
    Long countByTenantIdAndStatusIn(@Param("tenantId") Long tenantId, @Param("statuses") List<String> statuses);

    @Query("SELECT new com.nestely.pos.dto.TopItemDto(oi.item.name, SUM(oi.quantity), SUM(oi.totalPrice)) " +
           "FROM OrderItem oi WHERE oi.order.tenant.id = :tenantId AND oi.order.status IN ('CONFIRMED', 'COMPLETED') " +
           "GROUP BY oi.item.id, oi.item.name ORDER BY SUM(oi.quantity) DESC")
    List<com.nestely.pos.dto.TopItemDto> findTopSellingItems(@Param("tenantId") Long tenantId, Pageable pageable);
}
