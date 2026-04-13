<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<!-- Begin Page Content -->
<div class="container-fluid">
    <div class="loader"></div>
    <div class="flash-data" data-flashdata="<?= $this->session->flashdata('message'); ?>"></div>
    <!-- Page Heading -->
    <h1 class="h3 mb-4 text-gray-800"><?= $titel ?></h1>
    <div class="col-lg-6">
        <div class="card shadow mb-4" id="hidden">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Tambah Data Karyawan</h6>
            </div>
            <div class="card-body">
                <div class="form-group row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <input type="text" class="form-control form-control-user" name="nik" id="nik" placeholder="Nik Karyawan" required>
                    </div>
                    <div class="col-sm-6">
                        <input type="text" class="form-control form-control-user" name="nama" id="nama" placeholder="Nama Karyawan">
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <input type="text" class="form-control form-control-user" name="tempat_lahir" id="tempat_lahir" placeholder="Tempat lahir">
                    </div>
                    <div class="col-sm-6">
                        <input type="text" class="form-control form-control-user" name="tanggal_lahir" id="tanggal_lahir" placeholder="Tanggal Lahir">
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <input type="text" class="form-control form-control-user" nama="no_ktp" id="no_ktp" placeholder="Nomor KTP">
                    </div>
                    <div class="col-sm-6">
                        <select id="jenis_kelamin" name="jenis_kelamin" class="form-control">
                            <option value="pilih">Choose</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <input type="text" class="form-control form-control-user" name="telepon" id="telepon" placeholder="Telepon/HP">
                    </div>
                    <div class="col-sm-6">
                        <input type="text" class="form-control form-control-user" name="alamat" id="alamat" placeholder="Alamat">
                    </div>
                </div>
                <div class="my-2"></div>
                <a href="" class="btn btn-success btn-icon-split" id="simpanData">
                    <span class="icon text-white-50">
                        <i class="fas fa-check"></i>
                    </span>
                    <span class="text">Simpan Data</span>
                </a>
            </div>
        </div>
    </div>
    <div class="card mb-4 py-3 border-bottom-info">
        <div class="card-header py-3">
            <button type="submit" id="tambah" class="btn btn-primary">Insert Karyawan</button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tempat Lahir</th>
                            <th>Tanggal Lahir</th>
                            <th>jenis Kelamin</th>
                            <th>No HP/Telp</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>#</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tempat Lahir</th>
                            <th>Tanggal Lahir</th>
                            <th>jenis Kelamin</th>
                            <th>No HP/Telp</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        <?php $no = 1;
                        foreach ($karyawan as $kar) : ?>
                            <tr>
                                <td><?= $no ?></td>
                                <td><?= $kar['nik'] ?></td>
                                <td><?= $kar['nama'] ?></td>
                                <td><?= $kar['tempat_lahir'] ?></td>
                                <td><?= $kar['tanggal_lahir'] ?></td>
                                <td><?= $kar['jenis_kelamin'] ?></td>
                                <td><?= $kar['telepon'] ?></td>
                                <td>
                                    <a href="<?= base_url('kepegawaian/karyawan_detil') ?>/<?= $kar['nik'] ?>" class="btn btn-outline-info" title="Lihat Detil"><i class="fas fa-eye"></i></a>
                                    <a class="btn btn-outline-danger tombol-hapus" href="<?= base_url('kepegawaian/hapus') ?>/<?= $kar['nik'] ?>"><i class="fas fa-trash-restore"></i></a>
                                </td>
                            </tr>
                            <?php $no++;
                        endforeach; ?>
                    <tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<!-- /.container-fluid -->
<?php echo $this->load->view('footer') ?>
<script src="<?=base_url ('assets/js/jquery.maskedinput.js')?>"></script>
<script>
	jQuery(function ($) {
		$("#tanggal_lahir").mask("9999-99-99", {
			placeholder: "yyyy-mm-dd"
		});
        $("#telepon").mask("(+62) 999-9999-9999");
        $("#no_ktp").mask("9999999999999999");
	});
</script>
<script>
    $(".loader").hide();
    const hidden = document.querySelector('#hidden');
    $(hidden).hide();
    const tambah = document.querySelector('#tambah');
    tambah.addEventListener('click', function(e) {
        $(hidden).animate({
            height: 'toggle'
        });
        $(hidden).show();
        $(hidden).animate({
            left: '300px'
        });

    });
    const simpan = document.querySelector('#simpanData');
    simpan.addEventListener('click', function(e) {
        e.preventDefault();
        const nik = $('#nik').val();
        if (nik == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Nik Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const nama = $('#nama').val();
        if (nama == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Nama Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const tempat_lahir = $('#tempat_lahir').val();
        if (tempat_lahir == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Tempat Lahir Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const tanggal_lahir = $('#tanggal_lahir').val();
        if (tanggal_lahir == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Tanggal lahir Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const no_ktp = $('#no_ktp').val();
        if (no_ktp == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Nomor KTP Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const jenis_kelamin = $('#jenis_kelamin').val();
        if (jenis_kelamin == "pilih") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Jenis Kelamin Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const telepon = $('#telepon').val();
        if (telepon == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: ' Telepon Tidak Boleh Kosong Bos',
            })
            return false;
        }
        const alamat = $('#alamat').val();
        if (alamat == "") {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Alamat Tidak Boleh Kosong Bos',
            })
            return false;
        }
        $(".loader").show();
        $.ajax({
            url: "<?= base_url('kepegawaian/add'); ?>",
            type: "POST",
            data: {
                nik: nik,
                nama: nama,
                tempat_lahir: tempat_lahir,
                tanggal_lahir: tanggal_lahir,
                no_ktp: no_ktp,
                jenis_kelamin: jenis_kelamin,
                telepon: telepon,
                alamat: alamat
            },
            success: function() {
                document.location.href = "<?= base_url('kepegawaian/karyawan'); ?>";
                $(".loader").hide();
            }
        });
    });
</script>