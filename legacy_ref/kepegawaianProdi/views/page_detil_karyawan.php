<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<!-- Begin Page Content -->
<div class="container-fluid">
    <div class="flash-data" data-flashdata="<?= $this->session->flashdata('message'); ?>"></div>
    <!-- Page Heading -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h1 class="h3 mb-4 text-gray-800"><?= $titel ?></h1>
        </div>
        <div class="card-body">
            <?php foreach ($karyawan as $kar) : ?>
                <div class="row">
                    <div class="col-sm-6 mt-4">
                        <div class="card">
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th colspan="3">Profil</th>
                                            <th scope="col"><button type="button" class="btn btn-outline-success btn-sm" title="Edit Profil" data-toggle="modal" data-target="#modal_edit_profil<?= $kar['nik'] ?>"><i class="fas fa-marker"></i></button></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th colspan="3" style="text-align:center;">
                                                <?php if ($kar['pp']) { ?>
                                                    <img width="120px" class="center" src="<?= base_url('assets/foto') ?>/<?= $kar['pp'] ?>" alt="img-thumbnai Responsive image">
                                                <?php
                                                } else {
                                                    echo '<img  width="120px"  class="center" alt="img-thumbnai Responsive image" src="' . base_url('assets/img/icon.PNG') . '  ">';
                                                } ?>
                                            </th>
                                        <tr>
                                        <tr>
                                            <th colspan="3" style="text-align:center;">
                                                <a class="btn btn-primary" href="#" role="button" title="Upload photo" data-toggle="modal" data-target="#modal_edit_foto<?= $kar['nik'] ?>"><i class="fas fa-upload"></i> Photo</a>
                                            </th>
                                        <tr>
                                        <tr>
                                            <th scope=" row">Nik</th>
                                            <td>:</td>
                                            <td><?= $kar['nik'] ?></td>
                                        <tr>
                                            <th scope="row">Nama</th>
                                            <td>:</td>
                                            <td><?= $kar['nama'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Jenis Kelamin</th>
                                            <td>:</td>
                                            <td><?= $kar['jenis_kelamin'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Tempat lahir</th>
                                            <td>:</td>
                                            <td><?= $kar['tempat_lahir'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Tanggal Lahir</th>
                                            <td>:</td>
                                            <td><?= $kar['tanggal_lahir'] ?></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6  mt-4">
                        <div class="card">
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th colspan="3">Kepegawaian</th>
                                            <th scope="col"><button type="button" class="btn btn-outline-success btn-sm" title="Edit" data-toggle="modal" data-target="#modal_edit_kepegawaian<?= $kar['nik'] ?>"><i class="fas fa-marker"></i></button></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">No SK </th>
                                            <td>:</td>
                                            <?php if ($kar['nomor_sk']) : ?>
                                                <td><?= $kar['nomor_sk'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">TMT</th>
                                            <td>:</td>
                                            <?php if ($kar['tmt']) : ?>
                                                <td><?= $kar['tmt'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Lembaga Pengangkat</th>
                                            <td>:</td>
                                            <?php if ($kar['lembaga_pengangkat']) : ?>
                                                <td><?= $kar['lembaga_pengangkat'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Sumber Gaji</th>
                                            <td>:</td>
                                            <?php if ($kar['sumber_gaji']) : ?>
                                                <td><?= $kar['sumber_gaji'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Berkas SK</th>
                                            <td>:</td>
                                            <?php if ($kar['upload_sk']) : ?>
                                                <td><a href="<?= base_url('assets/SK') ?>/<?= $kar['upload_sk'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye">Berkas</i></a></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card mt-4">
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th colspan="3">Lainnya</th>
                                            <th scope="col"><button type="button" class="btn btn-outline-success btn-sm" title="Edit" data-toggle="modal" data-target="#modal_edit_npwp<?= $kar['nik'] ?>"><i class="fas fa-marker"></i></button></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">NPWP</th>
                                            <td>:</td>
                                            <?php if ($kar['nomor_npwp']) : ?>
                                                <td><?= $kar['nomor_npwp'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Berkas</th>
                                            <td>:</td>
                                            <?php if ($kar['upload_npwp']) : ?>
                                                <td><a href="<?= base_url('assets/npwp') ?>/<?= $kar['upload_npwp'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye">Berkas</i></a></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6  mt-4">
                        <div class="card">
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th colspan="3">Kependudukan Dan Kontak</th>
                                            <th scope="col"><button type="button" class="btn btn-outline-success btn-sm" title="Edit" data-toggle="modal" data-target="#modal_edit_kependudukan<?= $kar['nik'] ?>"><i class="fas fa-marker"></i></button></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">alamat</th>
                                            <td>:</td>
                                            <td><?= $kar['alamat'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">telepon</th>
                                            <td>:</td>
                                            <td><?= $kar['telepon'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Nomor KTP</th>
                                            <td>:</td>
                                            <td><?= $kar['nomor_ktp'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Agama</th>
                                            <td>:</td>
                                            <td><?= $kar['agama'] ?></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Berkas KTP</th>
                                            <td>:</td>
                                            <?php if ($kar['upload_ktp']) : ?>
                                                <td><a href="<?= base_url('assets/KTP') ?>/<?= $kar['upload_ktp'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye">Berkas</i></a></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6  mt-4">
                        <div class="card">
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th colspan="3"> Data Keluarga</th>
                                            <th scope="col"><button type="button" class="btn btn-outline-success btn-sm" title="Edit" data-toggle="modal" data-target="#modal_edit_keluarga<?= $kar['nik'] ?>"><i class="fas fa-marker"></i></button></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Status Perkawinan</th>
                                            <td>:</td>
                                            <?php if ($kar['status_perkawinan']) : ?>
                                                <td><?= $kar['status_perkawinan'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Nama Suami/istri</th>
                                            <td>:</td>
                                            <?php if ($kar['nama_ismi']) : ?>
                                                <td><?= $kar['nama_ismi'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Pekerjaan Suami/Istri</th>
                                            <td>:</td>
                                            <?php if ($kar['pekerjaan_ismi']) : ?>
                                                <td><?= $kar['pekerjaan_ismi'] ?></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                        <tr>
                                            <th scope="row">Berkas KK</th>
                                            <td>:</td>
                                            <?php if ($kar['upload_kk']) : ?>
                                                <td><a href="<?= base_url('assets/kk') ?>/<?= $kar['upload_kk'] ?>" target="_blank" title="Lihat Berkas"><i class="fas fa-eye">Berkas</i></a></td>
                                            <?php else : ?>
                                                <td>Belum Ada Data</td>
                                            <?php endif; ?>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<!-- Modal edit Keluarga -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_keluarga<?= $kar['nik'] ?>" tabindex=" -1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Data Kelauarga</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/updateKeluarga') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Status Pekawinan</label>
                            <input type="text" value="<?= $kar['status_perkawinan']; ?>" name="status_perkawinan" class="form-control" id="status_perkawinan" placeholder="status perkawinan ">
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="status_perkawinan" placeholder="status perkawinan ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Nama Suami/istri</label>
                            <input type="text" value="<?= $kar['nama_ismi']; ?>" name="nama_ismi" class="form-control" id="nama_ismi" placeholder="nama suami/istri ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Pekerjaan Suami/istri</label>
                            <input type="text" value="<?= $kar['pekerjaan_ismi']; ?>" name="pekerjaan_ismi" class="form-control" id="pekerjaan_ismi" placeholder="pekerjaan suami/istri ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Upload KK</label>
                            <input type="file" value="<?= $kar['upload_kk']; ?>" name="kk_upload" class="form-control" placeholder="Search for..." required>
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
<?php endforeach; ?>
<!-- Modal edit Kepegawaian -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_kepegawaian<?= $kar['nik'] ?>" tabindex=" -1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Data Kepegawaian</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/update_kepegawaian') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Penempatan</label>
                            <input type="text" value="<?= $kar['penempatan']; ?>" name="penempatan" class="form-control" id="status_perkawinan" placeholder="penempatan ">
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="nik" placeholder="nik ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Status Kepegawaian</label>
                            <input type="text" value="<?= $kar['status_kepegawaian']; ?>" name="status_kepegawaian" class="form-control" id="status_kepegawaian" placeholder="Status Kepegawaian ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Status Keaktivan</label>
                            <input type="text" value="<?= $kar['status_keaktivan']; ?>" name="status_keaktivan" class="form-control" id="status_keaktivan" placeholder="status_keaktivan">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Nomor SK Pengangkatan</label>
                            <input type="text" value="<?= $kar['nomor_sk']; ?>" name="nomor_sk" class="form-control" id="nomor_sk" placeholder="nomor_sk">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">TMT SK</label>
                            <input type="text" value="<?= $kar['tmt']; ?>" name="tmt" class="form-control" id="tmt" placeholder="tmt">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Lembaga Pengangkat</label>
                            <input type="text" value="<?= $kar['lembaga_pengangkat']; ?>" name="lembaga_pengangkat" class="form-control" id="lembaga_pengangkat" placeholder="lembaga_pengangkat">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Sumber Gaji</label>
                            <input type="text" value="<?= $kar['sumber_gaji']; ?>" name="sumber_gaji" class="form-control" id="sumber_gaji" placeholder="sumber_gaji">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Upload SK Karyawan</label>
                            <input type="file" value="<?= $kar['upload_sk']; ?>" name="sk_upload" class="form-control" placeholder="Search for..." required>
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
<?php endforeach; ?>
<!-- Modal kependudukan -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_kependudukan<?= $kar['nik'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Kependudukan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/updateKependudukan') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Nomor KTP</label>
                            <input type="text" value="<?= $kar['nomor_ktp']; ?>" name="nomor_ktp" class="form-control" id="nomor_ktp" placeholder="nomor_ktp ">
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="nik" placeholder="nik ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Telepon/HP</label>
                            <input type="text" value="<?= $kar['telepon']; ?>" name="telepon" class="form-control" id="telepon" placeholder="telepon ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Agama</label>
                            <input type="text" value="<?= $kar['agama']; ?>" name="agama" class="form-control" id="agama" placeholder="agama ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Alamat</label>
                            <input type="text" value="<?= $kar['alamat']; ?>" name="alamat" class="form-control" id="alamat" placeholder="alamat ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Upload KTP</label>
                            <input type="file" value="<?= $kar['upload_ktp']; ?>" name="ktp_upload" class="form-control" placeholder="Search for..." required>
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
<?php endforeach; ?>
<!-- Modal profil -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_profil<?= $kar['nik'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Update Profil</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/updateProfil') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Nama</label>
                            <input type="text" value="<?= $kar['nama']; ?>" name="nama" class="form-control" id="nama" placeholder="nama">
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="nik" placeholder="nik ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Jenis Kelamin</label>
                            <input type="text" value="<?= $kar['jenis_kelamin']; ?>" name="jenis_kelamin" class="form-control" id="jenis_kelamin" placeholder="jenis_kelamin">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Tempat Lahir</label>
                            <input type="text" value="<?= $kar['tempat_lahir']; ?>" name="tempat_lahir" class="form-control" id="tempat_lahir" placeholder="tempat_lahir">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Tanggal Lahir</label>
                            <input type="text" value="<?= $kar['tanggal_lahir']; ?>" name="tanggal_lahir" class="form-control" id="tanggal_lahir" placeholder="tanggal_lahir">
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
<?php endforeach; ?>
<!-- Modal -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_foto<?= $kar['nik'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/update_poto_profil') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Upload Foto</label>
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="nik" placeholder="nik ">
                            <input type="file" value="<?= $kar['pp']; ?>" name="poto_upload" class="form-control" placeholder="Search for..." required>
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
<?php endforeach; ?>
<!-- Modal -->
<?php foreach ($karyawan as $kar) : ?>
    <div class="modal fade" id="modal_edit_npwp<?= $kar['nik'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Data Wajib Pajak</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="<?= base_url('kepegawaianProdi/update_pajak') ?>" method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Nomor NPWP</label>
                            <input type="text" value="<?= $kar['nomor_npwp']; ?>" name="nomor_npwp" class="form-control" id="nomor_npwp" placeholder="nomor_npwp ">
                        </div>
                        <div class="form-group">
                            <label for="formGroupExampleInput2">Upload NPWP</label>
                            <input type="hidden" value="<?= $kar['nik']; ?>" name="nik" class="form-control" id="nik" placeholder="nik ">
                            <input type="file" value="<?= $kar['upload_npwp']; ?>" name="npwp_upload" class="form-control" placeholder="Search for..." required>
                        </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
                </form>
            </div>
        </div>
    </div>
<?php endforeach; ?>
<?php echo $this->load->view('footer') ?>