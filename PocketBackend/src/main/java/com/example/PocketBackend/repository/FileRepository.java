package com.example.PocketBackend.repository;

import com.example.PocketBackend.entity.FileEntity;
import com.example.PocketBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUser(User user);
}

