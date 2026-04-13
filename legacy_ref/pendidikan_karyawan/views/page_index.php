<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<?php
if (!empty($pendidikan)) {
    foreach ($pendidikan as $uf) {
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
            <h6 class="m-0 font-weight-bold text-primary">Data Riwayat Pendidikan <?= $nama ?></h6>
        </div>
        <div class="card-body">
            <a class="btn btn-info mb-4" href="" title="Edit Profil" data-toggle="modal" data-target="#modal_pendidikan<?= $nik ?>"><i class="far fa-plus-square"></i> Tambah Riwayat</a>
            <div class="table-responsive">
                <table class="table table-striped table-dark" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th scope="col">Jenjang Pendidikan</th>
                            <th scope="col">Asal Sekolah/Perguruan Tinggi</th>
                            <th scope="col">Tahun Lulus</th>
                            <th scope="col">Berkas Ijazah</th>
                            <th scope="col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($riwayat as $pen) : ?>
                            <tr>
                                <td><?= $this->data_param->get_jenjang($pen['id_pendidikan']) ?></td>
                                <td><?= $pen['asal_pendidikan'] ?></td>
                                <td><?= $pen['tahun_lulus'] ?></td>
                                <td>
                                    <?php if ($pen['upload_ijazah']) : ?>
                                        <a class="btn btn-success" href="<?= base_url('assets/ijazah') ?>/<?= $pen['upload_ijazah'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye"> Berkas Ijazah</i></a>
                                    <?php else : ?>
                                        <a class="btn btn-warning" href="" title="Edit" data-toggle="modal" data-target="#modal_edit_ijazah<?= $pen['id'] ?>"><i class="fas fa-upload"></i></a>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <a class="btn btn-danger tombol-hapus" href="<?= base_url('pendidikan_karyawan/delete') ?>/<?= $pen['id'] ?>"><i class="fas fa-trash-alt"></i></a>
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

<div class="modal fade" id="modal_pendidikan<?= $nik ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Tambah Pendidikan</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="<?= base_url('pendidikan_karyawan/insert_pendidikan') ?>" method="POST">
                    <div class="form-group">
                        <label for="exampleInputPassword1">Jenjang Pendidikan</label>
                        <select class="form-control" name="jenjang">
                            <?php foreach ($jenjang as $jen) : ?>
                                <option value="<?= $jen['id'] ?>">
                                    <?= $jen['nama_jenjang'] ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formGroupExampleInput2">Asal Sekolah</label>
                        <input type="text" value="" name="asal_sekolah" class="form-control">
                        <input type="hidden" value="<?= $nik ?>" name="nik" class="form-control" id="asal_sekolah" placeholder="asal_sekolah">
                    </div>
                    <div class="form-group">
                        <label for="formGroupExampleInput2">Tahun Lulus</label>
                        <input type="text" value="" name="tahun_lulus" class="form-control" id="tgl_lulus" placeholder="tgl_lulus">
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


<div class="modal fade" id="modal_edit_ijazah<?= $id ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Upload Ijazah</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="<?= base_url('pendidikan_karyawan/upload_ijazah') ?>" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="formGroupExampleInput2">Upload Ijazah</label>
                        <input type="hidden" value="<?= $id ?>" name="id" class="form-control" id="id" placeholder="nik ">
                        <input type="hidden" value="<?= $nik ?>" name="nik" class="form-control" id="id" placeholder="nik ">
                        <input type="file" name="ijazah_upload" class="form-control" placeholder="Search for..." required>
                    </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary">Upload</button>
            </div>
            </form>
        </div>
    </div>
</div>

<?php echo $this->load->view('footer') ?>