<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<?php
if (!empty($pelatihan)) {
    foreach ($pelatihan as $uf) {
        $nik = $uf['nik'];
        $nama = $uf['nama'];
        $id = $uf['id'];
    }
}
?>

<!-- Begin Page Content -->
<div class="container-fluid">
    <div class="flash-data" data-flashdata="<?= $this->session->flashdata('message'); ?>"></div>
    <!-- Page Heading -->
    <h1 class="h3 mb-4 text-gray-800"><?= $titel ?></h1>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Data Riwayat Pelatihan <?= $nama ?></h6>
        </div>
        <div class="card-body">
            <a class="btn btn-info mb-4" href="" title="Edit Profil" data-toggle="modal" data-target="#modal_pelatihan<?= $nik ?>"><i class="far fa-plus-square"></i> Tambah Riwayat</a>
            <div class="table-responsive">
                <table class="table table-striped table-dark" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th scope="col">Nama Diklat</th>
                            <th scope="col">Nomor Sertifikat</th>
                            <th scope="col">Tahun</th>
                            <th scope="col">Tempat dilaksanakan</th>
                            <th scope="col">Berkas</th>
                            <th scope="col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($riwayat as $pen) : ?>
                            <tr>
                                <td><?= $pen['nama_diklat'] ?></td>
                                <td><?= $pen['no_sertifikat'] ?></td>
                                <td><?= $pen['tahun'] ?></td>
                                <td><?= $pen['tempat'] ?></td>
                                <td>
                                    <?php if ($pen['upload']) : ?>
                                        <a class="btn btn-success" href="<?= base_url('assets/sertifikat') ?>/<?= $pen['upload'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye"> Berkas Sertifikat</i></a>
                                    <?php else : ?>
                                        <a class="btn btn-warning" href="" title="Edit" data-toggle="modal" data-target="#modal_upload<?= $pen['id'] ?>"><i class="fas fa-upload"></i></a>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <a class="btn btn-danger tombol-hapus" href="<?= base_url('kepegawaianProdi/deletePelatihan') ?>/<?= $pen['id'] ?>"><i class="fas fa-trash-alt"></i></a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<!-- Modal -->
<!-- Modal -->
<div class="modal fade" id="modal_pelatihan<?= $nik ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Tambah Riwayat Pelatihan <?= $nama ?></h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="<?= base_url('kepegawaianProdi/insert_pelatihan') ?>" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="formGroupExampleInput">Nama Diklat</label>
                        <input type="text" class="form-control" name="nama_diklat" id="nama_diklat" placeholder="nama_diklat">
                        <input type="hidden" value="<?= $nik ?>" class="form-control" name="nik" id="nik" placeholder="nik">
                    </div>
                    <div class="form-group">
                        <label for="formGroupExampleInput">Nomor Sertifikat</label>
                        <input type="text" class="form-control" name="no_sertifikat" id="no_sertifikat" placeholder="no_sertifikat">
                    </div>
                    <div class="form-group">
                        <label for="formGroupExampleInput">Tahun</label>
                        <input type="text" class="form-control" name="tahun" id="tahun" placeholder="tahun">
                    </div>
                    <div class="form-group">
                        <label for="formGroupExampleInput">Tempat</label>
                        <input type="text" class="form-control" name="tempat" id="tempat" placeholder="tempat">
                    </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary">Save changes</button>
            </div>
            </form>
        </div>
    </div>
</div>
<!-- Modal -->
<div class="modal fade" id="modal_upload<?= $id ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Upload Sertifikat <?= $nama ?> </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="<?= base_url('kepegawaianProdi/upload_sertifikat') ?>" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="formGroupExampleInput2">Upload Setifikat</label>
                        <input type="hidden" value="<?= $nik ?>" name="nik" class="form-control" id="id" placeholder="nik ">
                        <input type="hidden" value="<?= $id ?>" name="id" class="form-control" id="id" placeholder="nik ">
                        <input type="file" name="sertifikat_upload" class="form-control" placeholder="Search for..." required>
                    </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary">Upload Data</button>
            </div>
            </form>
        </div>
    </div>
</div>
<?php echo $this->load->view('footer') ?>