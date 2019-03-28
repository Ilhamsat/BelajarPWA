function createDatabase() {
    // apakah browser support dengan IDB
    if (!('indexedDB' in window)) {
        console.log('Web Browser tidak mendukung IDB');
        return;
    }
    // membuat database
    var request = window.indexedDB.open('db-a1');

    request.onerror = tanganiError;
    request.onupgradeneeded = (e) => {
        var db = e.target.result;
        db.onerror = tanganiError;
        // Buat objek baru
        var objStore = db.createObjectStore('mahasiswa',{keyPath : 'nim'});
        console.log('Object mahasiswa berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.onerror = tanganiError;
        console.log('Berhasil melakukan koneksi ke IDB');
        // LAKUKAN SESUATU ...
        bacaDariDB();
    }
}

function tanganiError(e) {
    console.log('Error IDB ' + e.target.errorCode);
}

createDatabase();
var tabel = document.getElementById('tabel-mahasiswa'),
    form = document.getElementById('form-tambah'),
    nama = document.getElementById('nama'),
    nim = document.getElementById('nim'),
    gender = document.getElementById('gender');

form.addEventListener('submit', tambahBaris);

function tambahBaris(e) {
    // cek apakah nim sudah ada di tabel
    if (tabel.rows.namedItem(nim.value)){
        alert("Error : NIM sudah terdaftar");
        e.preventDefault();
        return;
    }
    // masukkan ke database
    insertKeDB({
        nim : nim.value,
        nama : nama.value,
        gender : gender.value,
    });

    // modifikasi tabel dengan manggunakan fungsi appendChild()
    var baris = tabel.insertRow(); // => <tr></tr>
    baris.id = nim.value; // => <tr id="123"> </tr>
    baris.insertCell().appendChild(document.createTextNode(nim.value));
    baris.insertCell().appendChild(document.createTextNode(nama.value));
    baris.insertCell().appendChild(document.createTextNode(gender.value));

    // button
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = nim.value;
    btn.className = 'btn btn-danger btn-sm';
    baris.insertCell().appendChild(btn);
    e.preventDefault();
}

function insertKeDB(mahasiswa) {
    var objStore = buatTransaksi().objectStore('mahasiswa');
    var request = objStore.add(mahasiswa);
    request.onerror = tanganiError;
    request.onsuccess = console.log("Mahasiswa nim " + mahasiswa.nim +
    'berhasil ditambahkan ke DB');
}

function buatTransaksi() {
    var transaksi = db.transaction(['mahasiswa'],'readwrite');
    transaksi.onerror = tanganiError;
    transaksi.oncomplete = console.log("Transaksi selesai");

    return transaksi;
}

function bacaDariDB() {
    var objStore = buatTransaksi().objectStore('mahasiswa');
    objStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if (result){
            console.log('Membaca [' + result.value.nim + ' ] dari IDB ');

            // Append data ke tabel
            var baris = tabel.insertRow(); // => <tr></tr>
            baris.id = result.value.nim; // => <tr id="123"> </tr>
            baris.insertCell().appendChild(document.createTextNode(result.value.nim));
            baris.insertCell().appendChild(document.createTextNode(result.value.nama));
            baris.insertCell().appendChild(document.createTextNode(result.value.gender));

            // button
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.nim;
            btn.className = 'btn btn-danger btn-sm';
            baris.insertCell().appendChild(btn);
            result.continue();
        }
    }
}

tabel.addEventListener('click', hapusBaris);

function hapusBaris(x){
    if(x.target.type === 'button'){
        var hapus = confirm('Apakah anda ingin menghapus data  ini ?');
        if (hapus){
            tabel.deleteRow(tabel.rows.namedItem(x.target.id).sectionRowIndex);//hapus dari HTML
            //kemudian hapus dari DB ... 
            hapusDariDB(x.target.id);
        }
    }
}

function hapusDariDB(nim){
    var objStore = buatTransaksi().objectStore('mahasiswa');
    var request = objStore.delete(nim);
    request.error = tanganiError;
    request.onsuccess = console.log('Berhasil menghapus Mahasiswa [' + nim +' ]');
}