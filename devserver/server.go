package main

import (
	"flag"
	"log"
	"net/http"
	"path/filepath"
)

func main() {

	// start a local file server
	port := flag.String("p", "8080", "port to serve on")
	directory := flag.String("d", "..", "the directory of static file to host")
	flag.Parse()

	http.Handle("/", http.FileServer(http.Dir(*directory)))

	absPath, err := filepath.Abs(*directory)
	if err != nil {
		log.Printf("ERROR: Could not determine full directory path: +%v", err)
		absPath = *directory
	}

	log.Printf("Serving %s on HTTP port: %s\n", absPath, *port)
	log.Fatal(http.ListenAndServe("127.0.0.1:"+*port, nil))

}
