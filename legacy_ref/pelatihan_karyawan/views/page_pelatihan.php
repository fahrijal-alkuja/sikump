<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<!-- Begin Page Content -->
<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-4 text-gray-800"><?= $titel ?></h1>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">DataTables Karyawan</h6>
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
                                    <a href="<?= base_url('pelatihan_karyawan/riwayat') ?>/<?= $kar['nik'] ?>" class="btn btn-warning" title="Pelatihan"><i class="fas fa-certificate"></i></a>
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