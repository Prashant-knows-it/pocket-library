package com.example.PocketBackend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Books {

    private String bookTitle;
    private String authorName;
    private String description;
    private String genre;
    private int numberOfPages;
}
