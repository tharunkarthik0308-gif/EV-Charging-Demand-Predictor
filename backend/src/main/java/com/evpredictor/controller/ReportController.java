package com.evpredictor.controller;

import com.evpredictor.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping({"", "/download"})
    public ResponseEntity<byte[]> downloadReport(@RequestParam(defaultValue = "txt") String format) {
        String content;
        String filename;
        String contentType;

        if ("csv".equalsIgnoreCase(format)) {
            content = reportService.generateCsvReport();
            filename = "ev_charging_report.csv";
            contentType = "text/csv";
        } else {
            content = reportService.generateTxtReport();
            filename = "ev_charging_report.txt";
            contentType = "text/plain";
        }

        byte[] fileBytes = content.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(filename)
                .build());

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }
}
